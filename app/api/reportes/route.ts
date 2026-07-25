import { randomUUID } from "crypto";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { promptSistema } from "@/lib/beto";
import { reporteSchema, type ReporteGuardado } from "@/lib/schema";
import { guardarReporte } from "@/lib/storage";

export const maxDuration = 300;

const MAX_CHARS = 400_000;

export async function POST(req: Request) {
  let cuerpo: { grupo?: string; tipo?: string; chat?: string };
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

  // Si el chat es enorme, Beto se queda con la parte más reciente.
  const texto =
    chat.length > MAX_CHARS ? chat.slice(chat.length - MAX_CHARS) : chat;

  try {
    const { output } = await generateText({
      model: "anthropic/claude-sonnet-5",
      output: Output.object({ schema: reporteSchema }),
      system: promptSistema(tipo),
      prompt: `Nombre del grupo: ${grupo || "(sin nombre)"}\n\nChat exportado:\n\n${texto}`,
      maxOutputTokens: 16_000,
    });

    const guardado: ReporteGuardado = {
      id: randomUUID(),
      grupo,
      tipo,
      creado: new Date().toISOString(),
      reporte: output,
    };
    await guardarReporte(guardado);

    return NextResponse.json({ id: guardado.id });
  } catch (e) {
    console.error("Error generando reporte:", e);
    return NextResponse.json(
      { error: "Beto tuvo un problema leyendo el chat. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
