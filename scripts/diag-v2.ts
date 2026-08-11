// Diagnóstico local: escritura del monstruo con captura completa de issues.
import { readFileSync } from "fs";
import { generateText, Output } from "ai";
import { promptSistema } from "../lib/beto";
import { muestrearChat, resumenStats } from "../lib/parse-chat";
import { reporteSchemaV2 } from "../lib/schema";

for (const l of readFileSync(".env.local", "utf8").split("\n")) {
  const m = l.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

(async () => {
  const id = process.argv[2];
  const res = await fetch(`https://pggxy9kijbhwugdq.public.blob.vercel-storage.com/reportes/${id}.json?x=${Math.random()}`);
  const g = await res.json();
  const material =
    `NOTAS DE INVESTIGACIÓN del chat COMPLETO (${g.inputs.chat.length.toLocaleString("es-PA")} caracteres leídos al 100%):\n\n${g.inputs.notas.slice(0, 90_000)}\n\n` +
    `MUESTRA CRUDA del chat:\n\n${muestrearChat(g.inputs.chat, 25_000)}`;
  try {
    const { output } = await generateText({
      model: process.env.MODELO_REPORTE ?? "anthropic/claude-opus-5-fast",
      output: Output.object({ schema: reporteSchemaV2 }),
      temperature: 0.9,
      maxRetries: 0,
      system: promptSistema({ tipo: g.tipo, idioma: g.inputs.idioma ?? "", contexto: g.contexto ?? "", nota: g.inputs.nota ?? "", nombreUsuario: g.nombreUsuario ?? "", pais: g.inputs.pais ?? "", intensidad: g.inputs.intensidad ?? "normal" }),
      prompt: `Nombre del grupo: ${g.grupo}\n\n` + (g.stats ? `Estadísticas: ${resumenStats(g.stats)}\n\n` : "") + material,
      maxOutputTokens: 32_000,
      abortSignal: AbortSignal.timeout(250_000),
    });
    console.log("¡PASÓ! titulo:", output.titulo);
    // Guardarlo directamente: rescate del reporte real.
    const { put } = await import("@vercel/blob");
    await put(`reportes/${id}.json`, JSON.stringify({ ...g, estado: "listo", reporte2: output, inputs: undefined, procesando: undefined, errores: undefined }), { access: "public", addRandomSuffix: false, contentType: "application/json", allowOverwrite: true, cacheControlMaxAge: 60 });
    console.log("RESCATADO Y GUARDADO ✅");
  } catch (e: unknown) {
    const err = e as Error & { cause?: { cause?: { issues?: unknown[] }; value?: unknown } };
    console.log("FALLÓ:", err?.name, "-", (err?.message ?? "").slice(0, 120));
    const issues = err?.cause?.cause?.issues;
    if (issues) {
      console.log("ISSUES DE ZOD (los campos exactos):");
      for (const i of issues as { path?: unknown[]; message?: string; code?: string }[]) {
        console.log("  •", JSON.stringify(i.path), "→", i.code, "-", i.message);
      }
    } else {
      console.log("cause:", String(err?.cause ?? "").slice(0, 300));
    }
  }
})();
