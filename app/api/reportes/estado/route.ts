import { NextResponse } from "next/server";
import { leerReporte } from "@/lib/storage";

// Estado de un reporte que se está generando en background.
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const guardado = await leerReporte(id);
  if (!guardado) {
    return NextResponse.json({ estado: "no-existe" }, { status: 404 });
  }
  const estado = guardado.reporte ? "listo" : guardado.estado ?? "listo";
  return NextResponse.json({ estado });
}
