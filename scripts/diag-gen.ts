// Diagnóstico puntual: reproduce la generación del reporte fallido con los
// MISMOS inputs y muestra el error crudo del gateway. Uso: npx tsx scripts/diag-gen.ts
import { readFileSync } from "fs";
import { generateText, Output } from "ai";
import { promptSistema } from "../lib/beto";
import { resumenStats } from "../lib/parse-chat";
import { reporteSchema } from "../lib/schema";

// Cargar .env.local a mano (sin dotenv)
for (const linea of readFileSync(".env.local", "utf8").split("\n")) {
  const m = linea.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const g = JSON.parse(readFileSync("/tmp/buffet.json", "utf8"));

(async () => {
  const t0 = Date.now();
  try {
    const res = await generateText({
      model: process.env.MODELO_REPORTE ?? "anthropic/claude-opus-5-fast",
      output: Output.object({ schema: reporteSchema }),
      temperature: 0.9,
      maxRetries: 0,
      system: promptSistema({
        tipo: g.tipo,
        idioma: g.inputs.idioma ?? "",
        contexto: g.contexto ?? "",
        nota: g.inputs.nota ?? "",
        nombreUsuario: g.nombreUsuario ?? "",
        pais: g.inputs.pais ?? "",
        intensidad: g.inputs.intensidad ?? "normal",
      }),
      prompt:
        `Nombre del grupo: ${g.grupo || "(sin nombre)"}\n\n` +
        (g.stats
          ? `Estadísticas reales del grupo: ${resumenStats(g.stats)}\n\n`
          : "") +
        `Chat exportado:\n\n${g.inputs.chat}`,
      maxOutputTokens: 24_000,
      abortSignal: AbortSignal.timeout(240_000),
    });
    console.log("terminó en", ((Date.now() - t0) / 1000).toFixed(1), "s");
    console.log("finishReason:", res.finishReason);
    console.log("usage:", JSON.stringify(res.usage));
    const texto = res.text ?? "";
    console.log("texto chars:", texto.length);
    console.log("--- inicio (300) ---\n", texto.slice(0, 300));
    console.log("--- fin (900) ---\n", texto.slice(-900));
  } catch (e: unknown) {
    console.log("FALLÓ en", ((Date.now() - t0) / 1000).toFixed(1), "s");
    const err = e as Error & {
      cause?: unknown;
      responseBody?: string;
      statusCode?: number;
      data?: unknown;
      text?: string;
      finishReason?: string;
    };
    console.log("name:", err?.name);
    console.log("message:", (err?.message ?? "").slice(0, 800));
    // Volcado profundo: todas las propiedades y la cadena de causas.
    try {
      console.log(
        "DUMP:",
        JSON.stringify(e, Object.getOwnPropertyNames(e as object)).slice(0, 3000),
      );
    } catch {}
    let c: unknown = (e as { cause?: unknown })?.cause;
    for (let i = 0; c && i < 4; i++) {
      const ce = c as Error & { cause?: unknown; value?: unknown; text?: string };
      console.log(`cause[${i}]:`, ce?.name, "—", String(ce?.message ?? ce).slice(0, 600));
      if (ce?.text) console.log(`  texto (fin):`, ce.text.slice(-300));
      c = ce?.cause;
    }
  }
})();
