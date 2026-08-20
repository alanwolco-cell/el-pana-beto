import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { ejecutarGeneracion } from "@/lib/generar-reporte";
import {
  canjearCupon,
  codigoCortesia,
  descuentoReferido,
  precioDesbloqueo,
  registrarPago,
  validarDescuento,
} from "@/lib/pagos";
import { leerReporte } from "@/lib/storage";

// Un canje que desbloquea (código maestro o cupón BETO-) dispara la
// generación del reporte con waitUntil (flujo v2). Ventana completa para que
// la generación no muera a mitad.
export const maxDuration = 300;

// Freno de fuerza bruta (best-effort por instancia): el código maestro
// desbloquea gratis y AHORA además dispara generación de IA con costo, así
// que adivinarlo no puede ser gratis. En serverless esto no es un rate limit
// global, pero frena scripts simples sin infraestructura extra.
const intentosPorIp = new Map<string, { n: number; desde: number }>();
function excedeLimite(ip: string): boolean {
  const ahora = Date.now();
  const e = intentosPorIp.get(ip);
  if (!e || ahora - e.desde > 60_000) {
    intentosPorIp.set(ip, { n: 1, desde: ahora });
    return false;
  }
  e.n += 1;
  return e.n > 10;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconocida";
  if (excedeLimite(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un minuto y prueba de nuevo." },
      { status: 429 },
    );
  }
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

  // Código maestro de cortesía (solo el dueño): desbloquea el reporte + la
  // canción, gratis, y es REUTILIZABLE (no se marca como usado; sirve en
  // cualquier reporte). Idempotente por reporte gracias al oper fijo.
  const maestro = codigoCortesia();
  if (maestro && codigo === maestro) {
    await registrarPago(
      reporteId,
      {
        oper: `cortesia-${reporteId}`,
        monto: precioDesbloqueo(),
        nombre: "Cortesía Beto",
        fecha: new Date().toISOString(),
        plan: "expediente",
      },
      precioDesbloqueo(),
    );
    waitUntil(
      ejecutarGeneracion(reporteId, new URL(req.url).origin, {
        pagoConfirmado: true,
      }),
    );
    return NextResponse.json({ ok: true });
  }

  // Códigos PANA-: descuento de referido, no desbloquean, abaratan.
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

  waitUntil(
    ejecutarGeneracion(reporteId, new URL(req.url).origin, {
      pagoConfirmado: true,
    }),
  );

  return NextResponse.json({ ok: true });
}
