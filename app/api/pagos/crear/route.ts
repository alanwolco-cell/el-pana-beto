import { NextResponse } from "next/server";
import {
  comisionPagueloFacil,
  descuentoReferido,
  hostPagueloFacil,
  pagosConfigurados,
  PLANES,
  precioCancion,
  precioPlan,
  validarDescuento,
  type Plan,
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

  let cuerpo: {
    reporteId?: string;
    nombre?: string;
    plan?: string;
    partes?: number;
    descuento?: string;
  };
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

  const esCancion = cuerpo.plan === "cancion";
  const plan: Plan =
    cuerpo.plan === "doblete" || cuerpo.plan === "expediente"
      ? cuerpo.plan
      : "basico";
  const nombre = (cuerpo.nombre ?? "").trim().slice(0, 40) || "Alguien del grupo";
  // La vaca solo aplica al plan básico; PagueloFacil no cobra menos de $1.00.
  const partes =
    !esCancion && plan === "basico"
      ? Math.min(Math.max(Math.trunc(cuerpo.partes ?? 1), 1), 4)
      : 1;
  // Código de pana: descuento solo sobre el plan básico.
  let precio = esCancion ? precioCancion() : precioPlan(plan);
  let codigoDescuento = "";
  if (!esCancion && plan === "basico" && cuerpo.descuento) {
    const limpio = cuerpo.descuento.trim().toUpperCase();
    if (await validarDescuento(limpio)) {
      precio = Math.max(1, precio - descuentoReferido());
      codigoDescuento = limpio;
    }
  }
  // En la vaca (partes > 1) cada quien cubre su parte + su comisión de
  // PagueloFacil, así el precio del reporte le llega completo a Wolco.
  const base = precio / partes;
  const monto =
    partes > 1
      ? Math.max(1, Math.round((base + comisionPagueloFacil(base)) * 100) / 100)
      : Math.max(1, Math.round(base * 100) / 100);

  const descripcion = esCancion
    ? `El Pana Beto · La Canción del Grupo · ${guardado.grupo || "chat sin nombre"}`
    : `El Pana Beto · ${PLANES[plan].nombre} · ${guardado.grupo || "chat sin nombre"}`;

  const returnUrl = `${baseUrl(req)}/api/pagos/retorno`;
  const params = new URLSearchParams({
    CCLW: process.env.PF_CCLW!,
    CMTN: monto.toFixed(2),
    CDSC: descripcion.slice(0, 150),
    RETURN_URL: Buffer.from(returnUrl).toString("hex"),
    PARM_1: reporteId,
    PARM_2: encodeURIComponent(nombre),
    PARM_3: esCancion ? "cancion" : plan,
    PARM_4: codigoDescuento,
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
      { error: "La caja registradora de Beto se trabó. Intenta de nuevo." },
      { status: 502 },
    );
  }
}
