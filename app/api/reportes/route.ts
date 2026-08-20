import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { muestrearChat } from "@/lib/parse-chat";
import { type ReporteGuardado } from "@/lib/schema";
import { guardarFoto, guardarReporte } from "@/lib/storage";

// CREAR (flujo v2): guarda el "trabajo" y responde {id} en ~1s. La generación
// con IA arranca DESPUÉS del pago (retorno/canjear la disparan); este route ya
// no genera nada, así que no necesita ventana larga.
export const maxDuration = 60;

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

  let fotoUrl: string | undefined;
  if (cuerpo.foto) {
    try {
      fotoUrl = await guardarFoto(id, cuerpo.foto);
    } catch {
      fotoUrl = undefined;
    }
  }

  const intensidad: "suave" | "normal" | "salvaje" =
    cuerpo.intensidad === "suave" || cuerpo.intensidad === "salvaje"
      ? cuerpo.intensidad
      : "normal";

  const guardado: ReporteGuardado = {
    id,
    grupo,
    tipo,
    creado: new Date().toISOString(),
    mensajes:
      Number.isFinite(cuerpo.mensajes) && cuerpo.mensajes! > 0
        ? Math.trunc(cuerpo.mensajes!)
        : contarMensajes(chat),
    nombreUsuario: (cuerpo.nombreUsuario ?? "").slice(0, 40) || undefined,
    contexto: (cuerpo.contexto ?? "").slice(0, 60) || undefined,
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
    stats:
      cuerpo.stats &&
      Array.isArray(cuerpo.stats.porHora) &&
      cuerpo.stats.total > 0
        ? cuerpo.stats
        : undefined,
    fotoUrl,
    // Flujo v2: el job queda PENDIENTE y la IA no escribe nada todavía.
    // La generación (que es lo que cuesta plata) arranca cuando el pago
    // se registra (retorno de PagueloFacil o canje de código).
    estado: "pendiente",
    inputs: {
      // Se recorta de nuevo por seguridad aunque el cliente ya lo mande recortado.
      // Completo hasta 4M chars: el pipeline de 2 pasadas lo lee entero.
      chat: muestrearChat(chat, 4_000_000),
      idioma: (cuerpo.idioma ?? "").slice(0, 40) || undefined,
      nota: (cuerpo.nota ?? "").slice(0, 1000) || undefined,
      pais: (cuerpo.pais ?? "").slice(0, 40) || undefined,
      intensidad,
      telefono: (cuerpo.telefono ?? "").slice(0, 30) || undefined,
    },
  };

  try {
    await guardarReporte(guardado);
  } catch (e) {
    console.error("No se pudo crear el reporte:", e);
    return NextResponse.json(
      { error: "Beto no pudo guardar el reporte. Intenta de nuevo." },
      { status: 500 },
    );
  }

  // Flujo v2: aquí NO se genera nada; el job queda pendiente y la página
  // muestra el teaser con estadísticas reales ($0). La generación arranca
  // cuando el pago se registra (retorno/canjear la disparan con waitUntil, y
  // ejecutarGeneracion verifica el pago antes de gastar un centavo de IA).
  return NextResponse.json({ id });
}
