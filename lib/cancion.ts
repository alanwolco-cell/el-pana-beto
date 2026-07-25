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
  const material = [
    `Grupo: ${guardado.grupo || "el grupo"}`,
    `Veredicto: ${r.veredicto}`,
    `Integrantes y apodos: ${r.perfiles.map((p) => `${p.nombre} «${p.apodo}»`).join(", ")}`,
    `Premios: ${r.premios.map((p) => `${p.premio}: ${p.ganador}`).join("; ")}`,
    `Temas del grupo: ${r.temas.map((t) => t.titulo).join("; ")}`,
  ].join("\n");

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-5",
    system: `Eres Beto, el pana panameño que leyó todo el chat del grupo. Escribe la LETRA de una canción 100% ORIGINAL sobre este grupo, en español con sabor panameño, estilo ${genero}. Reglas: material completamente original (nada de melodías, letras ni frases de canciones existentes); usa los apodos, premios y temas del grupo; con humor y cariño, nunca cruel; estructura: [Verso 1], [Coro], [Verso 2], [Coro], [Puente], [Coro final]; máximo 2000 caracteres. Devuelve SOLO la letra con sus etiquetas de sección.`,
    prompt: material,
    maxOutputTokens: 1500,
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
      prompt: `Canción de ${genero} en español latino con sabor panameño, voz masculina carismática, alegre y con humor, producción moderna de alta calidad. Canta esta letra original.`,
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
