import { NextResponse } from "next/server";
import { leerReporte } from "@/lib/storage";

// Estado de un reporte que se está generando. NUNCA se cachea: el cliente
// hace polling y necesita el valor más reciente.
export const dynamic = "force-dynamic";

const SIN_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const guardado = await leerReporte(id);
  if (!guardado) {
    return NextResponse.json(
      { estado: "no-existe" },
      { status: 404, headers: SIN_CACHE },
    );
  }
  const estado =
    guardado.reporte || guardado.reporte2 || guardado.reporteMd
      ? "listo"
      : guardado.estado ?? "listo";
  return NextResponse.json({ estado }, { headers: SIN_CACHE });
}
