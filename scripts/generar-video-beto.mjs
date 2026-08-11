// Genera el clip "Beto caminando" con el AI Gateway (imagen → video) usando
// la foto oficial de Beto como referencia de personaje.
// Uso: node scripts/generar-video-beto.mjs [modelo]
import { readFileSync, writeFileSync } from "fs";
import { config } from "dotenv";
config({ path: ".env.local" });

const { experimental_generateVideo: generateVideo } = await import("ai");
const { gateway } = await import("@ai-sdk/gateway");

const modelo = process.argv[2] ?? "google/veo-3.1-fast-generate-001";
const imagen = readFileSync(new URL("../public/beto.jpg", import.meta.url));

console.log(`[${new Date().toISOString().slice(11, 19)}] generando con ${modelo}…`);
const t0 = Date.now();

const resultado = await generateVideo({
  model: gateway.video(modelo),
  prompt: {
    image: imagen,
    text: `The exact man from the reference image — a cheerful Panamanian señor with his painted straw hat (sombrero pintado) and guayabera — walks confidently down a colorful colonial street in Casco Viejo, Panama City. Golden hour sunlight, pastel colonial facades, balconies with bougainvillea. The camera smoothly tracks backwards in front of him at chest height while he strolls relaxed, greets someone off-screen with a small nod and a big warm smile, and adjusts his hat. Cinematic, shallow depth of field, warm film look. Ambient audio: faint salsa music from a window, street chatter, tropical birds. No text, no subtitles, no captions.`,
  },
  aspectRatio: "9:16",
  duration: 8,
});

const video = resultado.video ?? resultado.videos?.[0];
if (!video) throw new Error("Sin video en la respuesta");
const bytes = video.uint8Array ?? Buffer.from(video.base64, "base64");
writeFileSync(new URL("../public/beto-video.mp4", import.meta.url), Buffer.from(bytes));
console.log(
  `[${new Date().toISOString().slice(11, 19)}] listo en ${Math.round((Date.now() - t0) / 1000)}s — ${(bytes.length / 1e6).toFixed(1)}MB → public/beto-video.mp4`,
);
