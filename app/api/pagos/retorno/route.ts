import { NextResponse } from "next/server";
import {
  crearCupones,
  descuentoReferido,
  PLANES,
  precioDesbloqueo,
  registrarPago,
  registrarUsoReferido,
  type Plan,
} from "@/lib/pagos";

// RETURN_URL de PagueloFacil: llega por GET con los datos de la transacción.
// Los nombres de parámetros varían entre versiones del gateway, así que
// se leen con tolerancia.
function param(sp: URLSearchParams, ...nombres: string[]): string {
  for (const n of nombres) {
    const v = sp.get(n);
    if (v) return v;
  }
  return "";
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;

  const reporteId = param(sp, "PARM_1", "parm_1");
  const nombre = decodeURIComponent(param(sp, "PARM_2", "parm_2")) || "Alguien";
  const planRaw = param(sp, "PARM_3", "parm_3");
  const plan: Plan =
    planRaw === "doblete" || planRaw === "expediente" ? planRaw : "basico";
  const estado = param(sp, "Estado", "status", "ESTADO").toLowerCase();
  const oper = param(sp, "Oper", "oper", "codOper", "OPER");
  const total = Number(param(sp, "Total", "TotalPagado", "amount", "TOTAL"));

  const destino = (ok: string) =>
    NextResponse.redirect(
      new URL(`/r/${reporteId}?pago=${ok}`, req.url).toString(),
      303,
    );

  if (!reporteId) {
    return NextResponse.redirect(new URL("/", req.url).toString(), 303);
  }

  const aprobado =
    estado.includes("aprob") || estado === "1" || estado === "approved";

  if (!aprobado || !oper || !Number.isFinite(total) || total <= 0) {
    return destino("fallo");
  }

  // La canción es un producto aparte: se registra con su plan y no toca
  // ni la vaca ni los cupones.
  if (planRaw === "cancion") {
    await registrarPago(
      reporteId,
      {
        oper,
        monto: total,
        nombre,
        fecha: new Date().toISOString(),
        plan: "cancion",
      },
      precioDesbloqueo(),
    );
    return destino("cancion");
  }

  const codigoDescuento = param(sp, "PARM_4", "parm_4");
  const umbral = codigoDescuento
    ? Math.max(1, precioDesbloqueo() - descuentoReferido())
    : precioDesbloqueo();

  const { nuevo } = await registrarPago(
    reporteId,
    { oper, monto: total, nombre, fecha: new Date().toISOString() },
    umbral,
  );

  if (nuevo && PLANES[plan].cupones > 0) {
    await crearCupones(reporteId, PLANES[plan].cupones);
  }
  if (nuevo && codigoDescuento) {
    await registrarUsoReferido(codigoDescuento);
  }

  return destino("ok");
}
