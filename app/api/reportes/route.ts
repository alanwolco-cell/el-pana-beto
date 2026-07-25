import { randomUUID } from "crypto";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { promptSistema } from "@/lib/beto";
import { incrementarContador } from "@/lib/contador";
import { muestrearChat } from "@/lib/parse-chat";
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
  };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const grupo = (cuerpo.grupo ?? "").trim().slice(0, 100);
  const tipo =
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

  const texto = muestrearChat(chat);

  try {
    const opciones = {
      output: Output.object({ schema: reporteSchema }),
      // 0.9 en vez de 1.0: sigue creativo pero mucho menos propenso a
      // loops de repetición. maxRetries reintenta si la validación de
      // longitud rechaza un campo desbordado (el bug del loop).
      temperature: 0.9,
      maxRetries: 2,
      system: promptSistema({
        tipo,
        idioma: (cuerpo.idioma ?? "").slice(0, 40),
        contexto: (cuerpo.contexto ?? "").slice(0, 60),
        nota: (cuerpo.nota ?? "").slice(0, 1000),
        nombreUsuario: (cuerpo.nombreUsuario ?? "").slice(0, 40),
        pais: (cuerpo.pais ?? "").slice(0, 40),
        intensidad:
          cuerpo.intensidad === "suave" || cuerpo.intensidad === "salvaje"
            ? cuerpo.intensidad
            : "normal",
      }),
      prompt: `Nombre del grupo: ${grupo || "(sin nombre)"}\n\nChat exportado:\n\n${texto}`,
      maxOutputTokens: 12_000,
    };

    // Opus para el mejor humor; si no hay créditos en el Gateway (tier gratis),
    // cae automáticamente a Sonnet para que el sitio nunca se caiga.
    const preferido = process.env.MODELO_REPORTE ?? "anthropic/claude-opus-5";
    let output;
    try {
      ({ output } = await generateText({ model: preferido, ...opciones }));
    } catch (e) {
      // Cualquier fallo de Opus (créditos, rate limit, timeout, 5xx) cae a
      // Sonnet para que el sitio nunca se caiga. Solo se reintenta si el
      // preferido NO era ya Sonnet.
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

    const id = randomUUID();
    let fotoUrl: string | undefined;
    if (cuerpo.foto) {
      try {
        fotoUrl = await guardarFoto(id, cuerpo.foto);
      } catch {
        fotoUrl = undefined;
      }
    }

    const guardado: ReporteGuardado = {
      id,
      grupo,
      tipo,
      creado: new Date().toISOString(),
      mensajes:
        Number.isFinite(cuerpo.mensajes) && cuerpo.mensajes! > 0
          ? Math.trunc(cuerpo.mensajes!)
          : contarMensajes(chat),
      participantes: Array.isArray(cuerpo.participantes)
        ? cuerpo.participantes
            .filter(
              (p) =>
                p && typeof p.nombre === "string" && Number.isFinite(p.mensajes),
            )
            .slice(0, 15)
            .map((p) => ({
              nombre: p.nombre.slice(0, 40),
              mensajes: Math.trunc(p.mensajes),
            }))
        : undefined,
      fotoUrl,
      reporte: output,
    };
    await guardarReporte(guardado);

    try {
      await incrementarContador();
    } catch (e) {
      console.error("Contador falló (no bloquea el reporte):", e);
    }

    if (cuerpo.telefono && whatsappConfigurado()) {
      const base = process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : new URL(req.url).origin;
      try {
        await enviarReporteWhatsApp(
          cuerpo.telefono,
          output.titulo,
          `${base}/r/${id}`,
        );
      } catch (e) {
        console.error("WhatsApp falló (no bloquea el reporte):", e);
      }
    }

    return NextResponse.json({ id: guardado.id });
  } catch (e) {
    console.error("Error generando reporte:", e);
    return NextResponse.json(
      { error: "Beto tuvo un problema leyendo el chat. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
