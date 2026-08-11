import { NextResponse } from "next/server";
import { estaDesbloqueado, leerPagos } from "@/lib/pagos";
import type { ReporteGuardado } from "@/lib/schema";

// Limpieza diaria (cron de Vercel): cumple la promesa de privacidad del site.
// - Jobs "pendiente" nunca pagados con >7 días: se BORRAN completos (el chat
//   vive en inputs y nadie lo pidió).
// - Docs pagados atascados en "generando"/"error" con >7 días: se les quitan
//   los inputs (el chat) pero el doc queda, por si el dueño reclama.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: true, nota: "sin blob, nada que limpiar" });
  }

  const { list, del, put } = await import("@vercel/blob");
  const corte = Date.now() - SIETE_DIAS_MS;
  let borrados = 0;
  let despojados = 0;
  let revisados = 0;

  const { blobs } = await list({ prefix: "reportes/", limit: 1000 });
  // Solo blobs cuyo ÚLTIMO write es viejo (cada cambio de estado re-escribe
  // el blob, así que uploadedAt viejo = job abandonado de verdad).
  const viejos = blobs
    .filter((b) => new Date(b.uploadedAt).getTime() < corte)
    .slice(0, 200);

  for (const b of viejos) {
    revisados++;
    let doc: ReporteGuardado | null = null;
    try {
      doc = (await (await fetch(`${b.url}?x=${Date.now()}`)).json()) as ReporteGuardado;
    } catch {
      continue;
    }
    if (!doc?.id || !doc.inputs) continue; // listos ya no tienen inputs

    if (doc.estado === "pendiente" && !estaDesbloqueado(await leerPagos(doc.id))) {
      await del(b.url).catch(() => {});
      const { blobs: fotos } = await list({ prefix: `portadas/${doc.id}`, limit: 1 });
      for (const f of fotos) await del(f.url).catch(() => {});
      borrados++;
    } else if (doc.estado === "generando" || doc.estado === "error") {
      await put(`reportes/${doc.id}.json`, JSON.stringify({ ...doc, inputs: undefined }), {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      });
      despojados++;
    }
  }

  return NextResponse.json({ ok: true, revisados, borrados, despojados });
}
