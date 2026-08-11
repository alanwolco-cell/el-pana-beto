// Genera un clip de video con el AI Gateway (texto → video, o imagen → video
// si se pasa una imagen). Uso:
//   node scripts/generar-clip.mjs salida.mp4 "prompt en inglés" [imagenRef]
import { readFileSync, writeFileSync } from "fs";
import { config } from "dotenv";
config({ path: ".env.local" });

const { experimental_generateVideo: generateVideo } = await import("ai");
const { gateway } = await import("@ai-sdk/gateway");

const [, , salida, textoPrompt, imagenRef] = process.argv;
if (!salida || !textoPrompt) {
  console.error('uso: node generar-clip.mjs salida.mp4 "prompt" [imagenRef]');
  process.exit(1);
}

const t0 = Date.now();
console.log(`[${new Date().toISOString().slice(11, 19)}] generando ${salida}…`);
const resultado = await generateVideo({
  model: gateway.video("google/veo-3.1-fast-generate-001"),
  prompt: imagenRef
    ? { image: readFileSync(imagenRef), text: textoPrompt }
    : textoPrompt,
  aspectRatio: "9:16",
  duration: 8,
});
const video = resultado.video ?? resultado.videos?.[0];
if (!video) throw new Error("Sin video en la respuesta");
const bytes = video.uint8Array ?? Buffer.from(video.base64, "base64");
writeFileSync(salida, Buffer.from(bytes));
console.log(
  `[${new Date().toISOString().slice(11, 19)}] ${salida} listo en ${Math.round((Date.now() - t0) / 1000)}s — ${(bytes.length / 1e6).toFixed(1)}MB`,
);
