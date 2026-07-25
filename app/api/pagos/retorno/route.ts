import { NextResponse } from "next/server";
import { registrarPago } from "@/lib/pagos";

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

  await registrarPago(reporteId, {
    oper,
    monto: total,
    nombre,
    fecha: new Date().toISOString(),
  });
  return destino("ok");
}
