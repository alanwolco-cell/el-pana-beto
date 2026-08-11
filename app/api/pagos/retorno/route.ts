import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { ejecutarGeneracion } from "@/lib/generar-reporte";
import {
  crearCupones,
  descuentoReferido,
  PLANES,
  precioDesbloqueo,
  registrarPago,
  registrarUsoReferido,
  verificarTransaccion,
  type Plan,
} from "@/lib/pagos";

// El pago registrado dispara la generación del reporte con waitUntil (flujo
// v2: la IA escribe solo cuando entró la plata). waitUntil vive hasta
// maxDuration — con menos de 300s la generación moriría a mitad.
export const maxDuration = 300;

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

const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const RE_PANA = /^PANA-[A-Z0-9]{8}$/;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;

  const reporteId = param(sp, "PARM_1", "parm_1");
  const nombre = decodeURIComponent(param(sp, "PARM_2", "parm_2")).slice(0, 40) || "Alguien";
  const planRaw = param(sp, "PARM_3", "parm_3");
  const plan: Plan =
    planRaw === "doblete" || planRaw === "expediente" ? planRaw : "basico";
  const estado = param(sp, "Estado", "status", "ESTADO").toLowerCase();
  const oper = param(sp, "Oper", "oper", "codOper", "OPER");
  const total = Number(param(sp, "Total", "TotalPagado", "amount", "TOTAL"));

  const destino = (ok: string) =>
    NextResponse.redirect(
      new URL(`/r/${RE_UUID.test(reporteId) ? reporteId : ""}?pago=${ok}`, req.url).toString(),
      303,
    );

  // Path-traversal guard: el id del reporte debe ser un UUID válido.
  if (!RE_UUID.test(reporteId)) {
    return NextResponse.redirect(new URL("/", req.url).toString(), 303);
  }

  const aprobado =
    estado.includes("aprob") || estado === "1" || estado === "approved";

  if (!aprobado || !oper || !/^[\w-]{1,64}$/.test(oper) || !Number.isFinite(total) || total <= 0) {
    return destino("fallo");
  }

  // C2: el retorno GET NO es fuente de verdad — se confirma la transacción
  // server-side contra PagueloFacil antes de registrar nada.
  const verificado = await verificarTransaccion(oper, total);
  if (!verificado) {
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

  const codigoDescuentoRaw = param(sp, "PARM_4", "parm_4");
  const codigoDescuento = RE_PANA.test(codigoDescuentoRaw) ? codigoDescuentoRaw : "";
  const umbral = codigoDescuento
    ? Math.max(1, precioDesbloqueo() - descuentoReferido())
    : precioDesbloqueo();

  const { nuevo } = await registrarPago(
    reporteId,
    { oper, monto: total, nombre, fecha: new Date().toISOString(), plan },
    umbral,
  );

  if (nuevo && PLANES[plan].cupones > 0) {
    await crearCupones(reporteId, PLANES[plan].cupones);
  }
  if (nuevo && codigoDescuento) {
    await registrarUsoReferido(codigoDescuento);
  }

  // Pago registrado → Beto arranca a escribir. Idempotente: si el reporte ya
  // existe o hay otra corrida viva, no hace nada; si la vaca aún no completa
  // el monto, el gate de pago lo deja "pendiente" sin gastar IA.
  const base = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : new URL(req.url).origin;
  waitUntil(ejecutarGeneracion(reporteId, base, { pagoConfirmado: true }));

  return destino("ok");
}
