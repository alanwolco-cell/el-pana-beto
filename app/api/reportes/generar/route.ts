import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { ejecutarGeneracion } from "@/lib/generar-reporte";

export const maxDuration = 300;

// Dos modos:
// - SÍNCRONO (cliente de respaldo): corre la generación y responde su estado.
// - ENCADENADO (esperaMs en el body): responde al instante y corre en
//   background tras la espera: es el eslabón que usa el servidor para
//   auto-retomarse (cortes de etapa y reintentos) sin depender de que el
//   usuario tenga la página abierta. El presupuesto de reloj que se le pasa a
//   la generación descuenta la espera, para que los cortes de etapa sigan
//   siendo honestos dentro de los 300s de ESTA función.
export async function POST(req: Request) {
  const t0 = Date.now();
  let cuerpo: { id?: string; esperaMs?: number };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const id = cuerpo.id ?? "";
  const esperaMs = Math.min(Math.max(0, cuerpo.esperaMs ?? 0), 240_000);
  const base = new URL(req.url).origin;

  if (esperaMs > 0) {
    waitUntil(
      (async () => {
        await new Promise((r) => setTimeout(r, esperaMs));
        await ejecutarGeneracion(id, base, {
          presupuestoMs: 290_000 - (Date.now() - t0),
        });
      })().catch((e) => console.error("Eslabón encadenado falló:", e)),
    );
    return NextResponse.json({ estado: "encadenado" });
  }

  const estado = await ejecutarGeneracion(id, base);
  const status = estado === "no-existe" ? 404 : 200;
  return NextResponse.json({ estado }, { status });
}
