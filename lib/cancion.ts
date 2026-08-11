import { promises as fs } from "fs";
import path from "path";
import { generateText } from "ai";
import type { ReporteGuardado } from "./schema";

export type EstadoCancion = {
  reporteId: string;
  genero: string;
  letra: string;
  // Petición libre del usuario (voz, vibe, dedicatoria…). Se aplica a la letra
  // y al audio para que el primer disparo pegue (regenerar cuesta créditos).
  nota?: string;
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
  nota?: string,
): Promise<string> {
  const r = guardado.reporte;
  const r2 = guardado.reporte2;
  const md = guardado.reporteMd;
  if (!r && !r2 && !md) throw new Error("El reporte todavía no está listo.");
  if (md && !r && !r2) {
    // v3: el reporte es markdown libre — va directo como material.
    const materialMd =
      `Nombre del grupo: ${guardado.grupo || "el grupo"}\n\n` +
      `REPORTE DE BETO SOBRE EL GRUPO (usa los nombres, apodos y momentos TAL CUAL):\n${md.slice(0, 6000)}` +
      (nota ? `\n\nPETICIÓN ESPECIAL de quien pidió la canción: ${nota}` : "");
    return generarLetraDesdeMaterial(materialMd, genero);
  }
  // Material normalizado desde cualquiera de los dos formatos de reporte.
  const limpiar = (s: string) => s.replace(/\*\*/g, "").replace(/^>\s?/gm, "“") ;
  const veredicto = r?.veredicto ?? limpiar(r2!.apertura);
  const perfiles = r
    ? r.perfiles.map((p) => `  - ${p.nombre} “${p.apodo}”: ${p.descripcion}`)
    : r2!.perfiles.map(
        (p) => `  - ${p.nombre}${p.apodo ? ` “${p.apodo}”` : ""}: ${limpiar(p.cuerpo)}`,
      );
  const temas = r
    ? r.temas.map((t) => `${t.titulo} (${t.descripcion})`).join(" · ")
    : (r2!.secciones ?? [])
        .map((s) => `${s.titulo}: ${limpiar(s.cuerpo).slice(0, 300)}`)
        .join(" · ") ||
      `${r2!.temaTitulo ?? ""}: ${limpiar(r2!.tema ?? "")}`;
  const premios = (r?.premios ?? r2!.premios)
    .map((p) => `${p.premio} → ${p.ganador}: ${p.motivo}`)
    .join(" · ");
  const frases = r?.frases?.length
    ? r.frases.map((f) => `"${f.frase}" (${f.autor})`).join(" · ")
    : r2
      ? `"${r2.lineaMasLoca.cita}" (${r2.lineaMasLoca.autor})`
      : "";
  const material = [
    `Nombre del grupo: ${guardado.grupo || "el grupo"}`,
    `De qué se trata el grupo: ${veredicto}`,
    `Los personajes (usa estos nombres y apodos TAL CUAL en la letra):`,
    ...perfiles,
    `Temas/obsesiones del grupo: ${temas}`,
    `Premios: ${premios}`,
    frases ? `Frases célebres del grupo: ${frases}` : "",
    nota
      ? `PETICIÓN ESPECIAL de quien pidió la canción (cúmplela en lo que toque a la letra, sin romper las reglas): ${nota}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return generarLetraDesdeMaterial(material, genero);
}

async function generarLetraDesdeMaterial(
  material: string,
  genero: string,
): Promise<string> {
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
  nota?: string,
): Promise<Buffer> {
  const res = await fetch("https://api.elevenlabs.io/v1/music", {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // OJO (bug real): la API de ElevenLabs Music NO tiene campo de letras
      // (`lyrics_text` no existe y lo ignoraba en silencio → canciones
      // genéricas sin nada del chat). La letra VA DENTRO del prompt.
      prompt:
        `Estilo ${genero}, español latino con sabor panameño. Voz masculina carismática, potente y MUY CLARA (que se entienda cada palabra, nombre y apodo). Empieza FUERTE con el coro: hook pegajoso, energía alta desde el segundo uno, un buen drop/beat que enganche. Producción moderna, limpia y radiofónica, mezcla nítida (voz al frente, sin saturar).` +
        (nota ? `\nPetición del cliente (respétala en el estilo/voz): ${nota}.` : "") +
        `\n\nCANTA EXACTAMENTE ESTA LETRA, tal cual, sin cambiar ni inventar palabras (los nombres y apodos deben oírse claritos):\n\n${letra}`,
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
