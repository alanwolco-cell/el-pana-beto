import { promises as fs } from "fs";
import path from "path";

// Contador real de reportes generados, para prueba social en el landing.
// Mismo patrón de almacenamiento que lib/pagos.ts: Vercel Blob en producción
// (BLOB_READ_WRITE_TOKEN) con fallback a filesystem local en .data/.
//
// El total mostrado = total real + CONTADOR_BASE (env, default 1200), para
// que el número se vea creíble desde el día uno. El JSON guardado solo tiene
// el conteo real; la base se suma al leer, así se puede ajustar sin migrar datos.

type Contador = { total: number };

const usaBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const dirContador = path.join(process.cwd(), ".data", "contador");
const CLAVE = "reportes";

function baseContador(): number {
  const b = Number(process.env.CONTADOR_BASE);
  return Number.isFinite(b) && b >= 0 ? Math.trunc(b) : 1200;
}

async function leerJson<T>(prefijo: string, dir: string, clave: string): Promise<T | null> {
  if (usaBlob) {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: `${prefijo}/${clave}.json`, limit: 1 });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  }
  try {
    return JSON.parse(await fs.readFile(path.join(dir, `${clave}.json`), "utf8")) as T;
  } catch {
    return null;
  }
}

async function guardarJson(prefijo: string, dir: string, clave: string, valor: unknown): Promise<void> {
  const cuerpo = JSON.stringify(valor);
  if (usaBlob) {
    const { put } = await import("@vercel/blob");
    await put(`${prefijo}/${clave}.json`, cuerpo, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    });
    return;
  }
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${clave}.json`), cuerpo);
}

// Total a mostrar (real + base). Nunca lanza: si falla el storage devuelve la base.
export async function leerContador(): Promise<number> {
  try {
    const c = await leerJson<Contador>("contador", dirContador, CLAVE);
    return baseContador() + (c?.total ?? 0);
  } catch (e) {
    console.error("Error leyendo contador de reportes:", e);
    return baseContador();
  }
}

// Suma 1 al conteo real y devuelve el total a mostrar. Es prueba social, no
// contabilidad: el read-modify-write no es atómico y un error nunca debe
// tumbar el flujo de generación del reporte.
export async function incrementarContador(): Promise<number> {
  try {
    const c = (await leerJson<Contador>("contador", dirContador, CLAVE)) ?? { total: 0 };
    c.total += 1;
    await guardarJson("contador", dirContador, CLAVE, c satisfies Contador);
    return baseContador() + c.total;
  } catch (e) {
    console.error("Error incrementando contador de reportes:", e);
    return baseContador();
  }
}
