import { randomUUID } from "crypto";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { promptSistema } from "@/lib/beto";
import { reporteSchema, type ReporteGuardado } from "@/lib/schema";
import { guardarFoto, guardarReporte } from "@/lib/storage";
import { enviarReporteWhatsApp, whatsappConfigurado } from "@/lib/whatsapp";

export const maxDuration = 300;

const MAX_CHARS = 400_000;

function alSalto(texto: string, idx: number): number {
  const salto = texto.indexOf("\n", idx);
  return salto === -1 ? idx : salto + 1;
}

// Anti recency-bias: si el chat no cabe completo, se muestrea el inicio,
// el medio y el final en vez de quedarse solo con lo más reciente.
function muestrearChat(chat: string): string {
  if (chat.length <= MAX_CHARS) return chat;
  const tercio = Math.floor(MAX_CHARS / 3);
  const inicio = chat.slice(0, alSalto(chat, tercio));
  const desdeMedio = alSalto(chat, Math.floor(chat.length / 2));
  const medio = chat.slice(desdeMedio, alSalto(chat, desdeMedio + tercio));
  const fin = chat.slice(alSalto(chat, chat.length - tercio));
  const corte =
    "\n\n[NOTA: aquí se omitió un tramo del chat por longitud — considera igual las tres épocas]\n\n";
  return inicio + corte + medio + corte + fin;
}

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
  };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const grupo = (cuerpo.grupo ?? "").trim().slice(0, 100);
  const tipo = cuerpo.tipo === "profundo" ? "profundo" : "clasico";
  const chat = (cuerpo.chat ?? "").trim();

  if (chat.length < 500) {
    return NextResponse.json(
      { error: "El chat es muy corto. Beto necesita al menos unas cuantas conversaciones para opinar." },
      { status: 400 },
    );
  }

  const texto = muestrearChat(chat);

  try {
    const { output } = await generateText({
      model: "anthropic/claude-sonnet-5",
      output: Output.object({ schema: reporteSchema }),
      system: promptSistema({
        tipo,
        idioma: (cuerpo.idioma ?? "").slice(0, 40),
        contexto: (cuerpo.contexto ?? "").slice(0, 60),
        nota: (cuerpo.nota ?? "").slice(0, 1000),
        nombreUsuario: (cuerpo.nombreUsuario ?? "").slice(0, 40),
      }),
      prompt: `Nombre del grupo: ${grupo || "(sin nombre)"}\n\nChat exportado:\n\n${texto}`,
      maxOutputTokens: 16_000,
    });

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
      mensajes: contarMensajes(chat),
      fotoUrl,
      reporte: output,
    };
    await guardarReporte(guardado);

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
