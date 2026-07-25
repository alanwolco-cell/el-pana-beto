import { promises as fs } from "fs";
import path from "path";
import { generateText } from "ai";
import type { ReporteGuardado } from "./schema";

export type EstadoCancion = {
  reporteId: string;
  genero: string;
  letra: string;
  previewUrl?: string;
  completaUrl?: string;
};

export const GENEROS = [
  "Plena",
  "Reggaetón",
  "Típico panameño",
  "Salsa",
  "Balada de despecho",
  "Rock en español",
] as const;

const usaBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const dirLocal = path.join(process.cwd(), ".data", "canciones");

export function cancionConfigurada(): boolean {
  return !!process.env.ELEVENLABS_API_KEY && usaBlob;
}

export async function leerCancion(
  reporteId: string,
): Promise<EstadoCancion | null> {
  if (usaBlob) {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({
      prefix: `canciones/${reporteId}.json`,
      limit: 1,
    });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url);
    if (!res.ok) return null;
    return (await res.json()) as EstadoCancion;
  }
  try {
    return JSON.parse(
      await fs.readFile(path.join(dirLocal, `${reporteId}.json`), "utf8"),
    ) as EstadoCancion;
  } catch {
    return null;
  }
}

export async function guardarCancion(estado: EstadoCancion): Promise<void> {
  const cuerpo = JSON.stringify(estado);
  if (usaBlob) {
    const { put } = await import("@vercel/blob");
    await put(`canciones/${estado.reporteId}.json`, cuerpo, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    });
    return;
  }
  await fs.mkdir(dirLocal, { recursive: true });
  await fs.writeFile(path.join(dirLocal, `${estado.reporteId}.json`), cuerpo);
}

// Letra 100% original, escrita a partir del reporte del grupo.
export async function generarLetra(
  guardado: ReporteGuardado,
  genero: string,
): Promise<string> {
  const r = guardado.reporte;
  if (!r) throw new Error("El reporte todavía no está listo.");
  const material = [
    `Nombre del grupo: ${guardado.grupo || "el grupo"}`,
    `De qué se trata el grupo: ${r.veredicto}`,
    `Los personajes (usa estos nombres y apodos TAL CUAL en la letra):`,
    ...r.perfiles.map((p) => `  - ${p.nombre} «${p.apodo}»: ${p.descripcion}`),
    `Temas/obsesiones del grupo: ${r.temas.map((t) => `${t.titulo} (${t.descripcion})`).join(" · ")}`,
    `Premios: ${r.premios.map((p) => `${p.premio} → ${p.ganador}: ${p.motivo}`).join(" · ")}`,
    r.frases?.length
      ? `Frases célebres del grupo: ${r.frases.map((f) => `"${f.frase}" (${f.autor})`).join(" · ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-5",
    system: `Eres Beto, el pana panameño que leyó todo el chat de ESTE grupo específico. Escribe la LETRA de una canción 100% ORIGINAL y ESPECÍFICA sobre ellos, estilo ${genero}, español con sabor panameño.

REGLAS CLAVE:
- La canción tiene que ser SOBRE ESTE GRUPO EN PARTICULAR — nada genérico. Menciona nombres reales, apodos reales y momentos reales del material. Alguien del grupo tiene que escucharla y decir "esto es sobre NOSOTROS".
- EL CORO ES LO MÁS IMPORTANTE (es lo que se va a escuchar primero): tiene que decir el NOMBRE DEL GRUPO literal y nombrar a 2-3 integrantes, con el gancho más pegajoso. Que en los primeros segundos ya se entienda que la canción es de ELLOS. El coro corto, repetible, imposible de no cantar.
- Nombra al menos 4 integrantes por su nombre/apodo dentro de la letra, cada uno con el detalle que lo hace único.
- Escribe frases CORTAS y cantables (no párrafos largos): líneas de 6-10 palabras que rimen y fluyan. Nada de oraciones enredadas — esto se canta, no se lee.
- Humor y cariño, con el toque roast de Beto. Nunca cruel.
- Material 100% original: todo inventado por ti, sin parecerse a ninguna canción existente.
- Estructura con etiquetas EXACTAS: [Coro] [Verso 1] [Coro] [Verso 2] [Coro]. Empieza por el coro. Máximo 1600 caracteres.
- Devuelve SOLO la letra con sus etiquetas.`,
    prompt: material,
    maxOutputTokens: 1500,
    temperature: 1,
  });
  return text.trim().slice(0, 3900);
}

export async function generarAudio(
  genero: string,
  letra: string,
  duracionMs: number,
): Promise<Buffer> {
  const res = await fetch("https://api.elevenlabs.io/v1/music", {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // La letra manda: la música debe CANTAR exactamente estas palabras.
      prompt: `Estilo ${genero}, español latino con sabor panameño. Voz masculina carismática, potente y MUY CLARA (que se entienda cada palabra, nombre y apodo). Canta EXACTAMENTE la letra provista, sin cambiar ni improvisar. Empieza FUERTE con el coro: hook pegajoso, energía alta desde el segundo uno, un buen drop/beat que enganche. Producción moderna, limpia y radiofónica, mezcla nítida (voz al frente, sin saturar). Que los primeros segundos hagan querer subir el volumen.`,
      lyrics_text: letra,
      music_length_ms: duracionMs,
    }),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function guardarAudio(
  ruta: string,
  audio: Buffer,
): Promise<string> {
  const { put } = await import("@vercel/blob");
  const blob = await put(ruta, audio, {
    access: "public",
    addRandomSuffix: false,
    contentType: "audio/mpeg",
  });
  return blob.url;
}
