import { NextResponse } from "next/server";
import {
  canjearCupon,
  descuentoReferido,
  precioDesbloqueo,
  registrarPago,
  validarDescuento,
} from "@/lib/pagos";
import { leerReporte } from "@/lib/storage";

export async function POST(req: Request) {
  let cuerpo: { reporteId?: string; codigo?: string };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const reporteId = cuerpo.reporteId ?? "";
  const codigo = (cuerpo.codigo ?? "").trim().toUpperCase();
  if (!(await leerReporte(reporteId))) {
    return NextResponse.json({ error: "Reporte no existe" }, { status: 404 });
  }

  // Códigos PANA-: descuento de referido, no desbloquean — abaratan.
  if (codigo.startsWith("PANA-")) {
    if (await validarDescuento(codigo)) {
      return NextResponse.json({ descuento: descuentoReferido(), codigo });
    }
    return NextResponse.json(
      { error: "Beto no reconoce ese código de pana. Revísalo bien." },
      { status: 400 },
    );
  }

  const resultado = await canjearCupon(codigo);
  if (resultado === "invalido") {
    return NextResponse.json(
      { error: "Beto no reconoce ese código. Revísalo bien." },
      { status: 400 },
    );
  }
  if (resultado === "usado") {
    return NextResponse.json(
      { error: "Ese código ya se usó. Beto no fía dos veces." },
      { status: 400 },
    );
  }

  await registrarPago(
    reporteId,
    {
      oper: `cupon-${codigo}`,
      monto: precioDesbloqueo(),
      nombre: "Código de Beto",
      fecha: new Date().toISOString(),
    },
    precioDesbloqueo(),
  );

  return NextResponse.json({ ok: true });
}
