import { randomUUID } from "crypto";
import { generateText, Output } from "ai";
import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { promptSistema } from "@/lib/beto";
import { incrementarContador } from "@/lib/contador";
import { muestrearChat, resumenStats } from "@/lib/parse-chat";
import { reporteSchema, type ReporteGuardado } from "@/lib/schema";
import { guardarFoto, guardarReporte } from "@/lib/storage";
import { enviarReporteWhatsApp, whatsappConfigurado } from "@/lib/whatsapp";

export const maxDuration = 300;

function contarMensajes(chat: string): number {
  const patron = /^\[?‎?\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/gm;
  const conteo = chat.match(patron)?.length ?? 0;
  return conteo > 10 ? conteo : chat.split("\n").filter(Boolean).length;
}

export async function POST(req: Request) {
  let cuerpo: {
    grupo?: string;
    tipo?: string;
    chat?: string;
    idioma?: string;
    contexto?: string;
    nota?: string;
    nombreUsuario?: string;
    foto?: string;
    telefono?: string;
    mensajes?: number;
    pais?: string;
    participantes?: { nombre: string; mensajes: number }[];
    intensidad?: string;
    stats?: ReporteGuardado["stats"];
  };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const grupo = (cuerpo.grupo ?? "").trim().slice(0, 100);
  const tipo: "clasico" | "profundo" | "yeye" =
    cuerpo.tipo === "profundo" || cuerpo.tipo === "yeye"
      ? cuerpo.tipo
      : "clasico";
  const chat = (cuerpo.chat ?? "").trim();

  if (chat.length < 500) {
    return NextResponse.json(
      { error: "El chat es muy corto. Beto necesita al menos unas cuantas conversaciones para opinar." },
      { status: 400 },
    );
  }

  const id = randomUUID();
  const mensajes =
    Number.isFinite(cuerpo.mensajes) && cuerpo.mensajes! > 0
      ? Math.trunc(cuerpo.mensajes!)
      : contarMensajes(chat);
  const participantes = Array.isArray(cuerpo.participantes)
    ? cuerpo.participantes
        .filter(
          (p) => p && typeof p.nombre === "string" && Number.isFinite(p.mensajes),
        )
        .slice(0, 15)
        .map((p) => ({ nombre: p.nombre.slice(0, 40), mensajes: Math.trunc(p.mensajes) }))
    : undefined;
  const stats =
    cuerpo.stats && Array.isArray(cuerpo.stats.porHora) && cuerpo.stats.total > 0
      ? cuerpo.stats
      : undefined;

  const base = {
    id,
    grupo,
    tipo,
    creado: new Date().toISOString(),
    mensajes,
    nombreUsuario: String(cuerpo.nombreUsuario ?? "").slice(0, 40) || undefined,
    participantes,
    stats,
  };

  // Guarda un marcador "generando" de una vez y devuelve el id al instante.
  // Así el cliente ya tiene el link y puede irse de la app: la generación
  // sigue en el servidor (waitUntil) y el reporte aparece al volver.
  await guardarReporte({ ...base, estado: "generando" } as ReporteGuardado);

  waitUntil(
    generarEnBackground({ id, base, chat, cuerpo, grupo, tipo, req }).catch(
      async (e) => {
        console.error("Error generando reporte en background:", e);
        try {
          await guardarReporte({ ...base, estado: "error" } as ReporteGuardado);
        } catch {}
      },
    ),
  );

  return NextResponse.json({ id });
}

async function generarEnBackground({
  id,
  base,
  chat,
  cuerpo,
  grupo,
  tipo,
  req,
}: {
  id: string;
  base: Omit<ReporteGuardado, "reporte">;
  chat: string;
  cuerpo: Record<string, unknown>;
  grupo: string;
  tipo: string;
  req: Request;
}) {
  const texto = muestrearChat(chat);

  const opciones = {
    output: Output.object({ schema: reporteSchema }),
    temperature: 0.9,
    maxRetries: 2,
    system: promptSistema({
      tipo: tipo as "clasico" | "profundo" | "yeye",
      idioma: String(cuerpo.idioma ?? "").slice(0, 40),
      contexto: String(cuerpo.contexto ?? "").slice(0, 60),
      nota: String(cuerpo.nota ?? "").slice(0, 1000),
      nombreUsuario: String(cuerpo.nombreUsuario ?? "").slice(0, 40),
      pais: String(cuerpo.pais ?? "").slice(0, 40),
      intensidad:
        cuerpo.intensidad === "suave" || cuerpo.intensidad === "salvaje"
          ? (cuerpo.intensidad as "suave" | "salvaje")
          : "normal",
    }),
    prompt:
      `Nombre del grupo: ${grupo || "(sin nombre)"}\n\n` +
      (cuerpo.stats
        ? `Estadísticas reales del grupo (ya calculadas, úsalas para uno o dos chistes: quién escribe a esas horas, qué dice de ellos el día/mes pico): ${resumenStats(cuerpo.stats as Parameters<typeof resumenStats>[0])}\n\n`
        : "") +
      `Chat exportado:\n\n${texto}`,
    maxOutputTokens: 9_000,
  };

  const preferido =
    process.env.MODELO_REPORTE ?? "anthropic/claude-opus-5-fast";
  let output;
  try {
    ({ output } = await generateText({ model: preferido, ...opciones }));
  } catch (e) {
    if (/sonnet/.test(preferido)) throw e;
    console.warn(
      "Falló el modelo preferido; usando Sonnet:",
      e instanceof Error ? e.message : String(e),
    );
    ({ output } = await generateText({
      model: "anthropic/claude-sonnet-5",
      ...opciones,
    }));
  }

  let fotoUrl: string | undefined;
  if (cuerpo.foto) {
    try {
      fotoUrl = await guardarFoto(id, String(cuerpo.foto));
    } catch {
      fotoUrl = undefined;
    }
  }

  const guardado: ReporteGuardado = {
    ...base,
    fotoUrl,
    estado: "listo",
    reporte: output,
  };
  await guardarReporte(guardado);

  try {
    await incrementarContador();
  } catch (e) {
    console.error("Contador falló:", e);
  }

  if (cuerpo.telefono && whatsappConfigurado()) {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : new URL(req.url).origin;
    try {
      await enviarReporteWhatsApp(
        String(cuerpo.telefono),
        output.titulo,
        `${baseUrl}/r/${id}`,
      );
    } catch (e) {
      console.error("WhatsApp falló:", e);
    }
  }
}
