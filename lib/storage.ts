import { promises as fs } from "fs";
import path from "path";
import type { ReporteGuardado } from "./schema";

const usaBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const dirLocal = path.join(process.cwd(), ".data", "reportes");

export async function guardarReporte(reporte: ReporteGuardado): Promise<void> {
  const cuerpo = JSON.stringify(reporte);
  if (usaBlob) {
    const { put } = await import("@vercel/blob");
    await put(`reportes/${reporte.id}.json`, cuerpo, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    return;
  }
  await fs.mkdir(dirLocal, { recursive: true });
  await fs.writeFile(path.join(dirLocal, `${reporte.id}.json`), cuerpo);
}

export async function leerReporte(
  id: string,
): Promise<ReporteGuardado | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  if (usaBlob) {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: `reportes/${id}.json`, limit: 1 });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url);
    if (!res.ok) return null;
    return (await res.json()) as ReporteGuardado;
  }
  try {
    const raw = await fs.readFile(path.join(dirLocal, `${id}.json`), "utf8");
    return JSON.parse(raw) as ReporteGuardado;
  } catch {
    return null;
  }
}
