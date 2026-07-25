import { NextResponse } from "next/server";
import {
  hostPagueloFacil,
  pagosConfigurados,
  precioReporte,
} from "@/lib/pagos";
import { leerReporte } from "@/lib/storage";

function baseUrl(req: Request): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  if (!pagosConfigurados()) {
    return NextResponse.json({ error: "Pagos no configurados" }, { status: 503 });
  }

  let cuerpo: { reporteId?: string; nombre?: string; partes?: number };
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

  const nombre = (cuerpo.nombre ?? "").trim().slice(0, 40) || "Alguien del grupo";
  const partes = Math.min(Math.max(Math.trunc(cuerpo.partes ?? 1), 1), 6);
  const precio = precioReporte(guardado.tipo);
  // PagueloFacil no acepta cobros menores a $1.00
  const monto = Math.max(1, Math.round((precio / partes) * 100) / 100);

  const returnUrl = `${baseUrl(req)}/api/pagos/retorno`;
  const params = new URLSearchParams({
    CCLW: process.env.PF_CCLW!,
    CMTN: monto.toFixed(2),
    CDSC: `El Pana Beto - Reporte "${guardado.grupo || "sin nombre"}"`.slice(0, 150),
    RETURN_URL: Buffer.from(returnUrl).toString("hex"),
    PARM_1: reporteId,
    PARM_2: encodeURIComponent(nombre),
  });

  try {
    const res = await fetch(`${hostPagueloFacil()}/LinkDeamon.cfm`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await res.json();
    const url: string | undefined = data?.data?.url ?? data?.data?.URL;
    if (!res.ok || !url) throw new Error(JSON.stringify(data).slice(0, 300));
    return NextResponse.json({ url, monto });
  } catch (e) {
    console.error("Error creando pago PagueloFacil:", e);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago. Intenta de nuevo." },
      { status: 502 },
    );
  }
}
