import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  cancionConfigurada,
  generarAudio,
  guardarAudio,
  guardarCancion,
  leerCancion,
} from "@/lib/cancion";
import { cancionComprada, leerPagos } from "@/lib/pagos";

export const maxDuration = 300;

export async function POST(req: Request) {
  if (!cancionConfigurada()) {
    return NextResponse.json(
      { error: "La rockola de Beto está apagada por ahora." },
      { status: 503 },
    );
  }

  let cuerpo: { reporteId?: string };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const reporteId = cuerpo.reporteId ?? "";
  const cancion = await leerCancion(reporteId);
  if (!cancion?.previewUrl) {
    return NextResponse.json(
      { error: "Primero hay que crear el preview." },
      { status: 400 },
    );
  }
  if (cancion.completaUrl) {
    return NextResponse.json({ completaUrl: cancion.completaUrl });
  }

  const pagos = await leerPagos(reporteId);
  if (!cancionComprada(pagos)) {
    return NextResponse.json(
      { error: "Beto guarda la completa para el que la desbloquea." },
      { status: 402 },
    );
  }

  try {
    const audio = await generarAudio(
      cancion.genero,
      cancion.letra,
      150_000,
      cancion.nota,
    );
    // Sufijo aleatorio: que nadie adivine la URL sin pagar.
    const completaUrl = await guardarAudio(
      `canciones/${reporteId}-completa-${randomUUID().slice(0, 8)}.mp3`,
      audio,
    );
    await guardarCancion({ ...cancion, completaUrl });
    return NextResponse.json({ completaUrl });
  } catch (e) {
    console.error("Error generando canción completa:", e);
    return NextResponse.json(
      { error: "A Beto se le desafinó la guitarra. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
