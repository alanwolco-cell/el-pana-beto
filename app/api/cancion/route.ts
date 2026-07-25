import { NextResponse } from "next/server";
import {
  cancionConfigurada,
  generarAudio,
  generarLetra,
  GENEROS,
  guardarAudio,
  guardarCancion,
  leerCancion,
} from "@/lib/cancion";
import { leerReporte } from "@/lib/storage";

export const maxDuration = 300;

export async function POST(req: Request) {
  if (!cancionConfigurada()) {
    return NextResponse.json(
      { error: "La rockola de Beto está apagada por ahora." },
      { status: 503 },
    );
  }

  let cuerpo: { reporteId?: string; genero?: string };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const reporteId = cuerpo.reporteId ?? "";
  const guardado = await leerReporte(reporteId);
  if (!guardado) {
    return NextResponse.json({ error: "Reporte no existe" }, { status: 404 });
  }

  // Si ya hay preview, no se regenera (los créditos no crecen en los árboles).
  const existente = await leerCancion(reporteId);
  if (existente?.previewUrl) {
    return NextResponse.json({ previewUrl: existente.previewUrl });
  }

  const genero = GENEROS.find((g) => g === cuerpo.genero) ?? "Plena";

  try {
    const letra = await generarLetra(guardado, genero);
    // Preview: primeras secciones de la letra, 30 segundos de audio.
    const letraPreview = letra.split(/\n(?=\[)/).slice(0, 2).join("\n");
    const audio = await generarAudio(genero, letraPreview, 30_000);
    const previewUrl = await guardarAudio(
      `canciones/${reporteId}-preview.mp3`,
      audio,
    );
    await guardarCancion({ reporteId, genero, letra, previewUrl });
    return NextResponse.json({ previewUrl });
  } catch (e) {
    console.error("Error generando canción:", e);
    return NextResponse.json(
      { error: "A Beto se le desafinó la guitarra. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
