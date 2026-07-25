import { promises as fs } from "fs";
import path from "path";

export type Pago = {
  oper: string;
  monto: number;
  nombre: string;
  fecha: string;
};

export type EstadoPagos = {
  reporteId: string;
  precio: number;
  pagos: Pago[];
};

const usaBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const dirLocal = path.join(process.cwd(), ".data", "pagos");

export function pagosConfigurados(): boolean {
  return !!process.env.PF_CCLW;
}

export function precioReporte(): number {
  const p = Number(process.env.PRECIO_REPORTE);
  return Number.isFinite(p) && p >= 1 ? p : 4.99;
}

export function hostPagueloFacil(): string {
  return process.env.PF_SANDBOX === "1"
    ? "https://sandbox.paguelofacil.com"
    : "https://secure.paguelofacil.com";
}

export function totalPagado(estado: EstadoPagos): number {
  return estado.pagos.reduce((s, p) => s + p.monto, 0);
}

export function estaDesbloqueado(estado: EstadoPagos | null): boolean {
  if (!pagosConfigurados()) return true;
  if (!estado) return false;
  // margen de 5 centavos por redondeos al dividir
  return totalPagado(estado) >= estado.precio - 0.05;
}

export async function leerPagos(reporteId: string): Promise<EstadoPagos | null> {
  if (usaBlob) {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: `pagos/${reporteId}.json`, limit: 1 });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url);
    if (!res.ok) return null;
    return (await res.json()) as EstadoPagos;
  }
  try {
    const raw = await fs.readFile(path.join(dirLocal, `${reporteId}.json`), "utf8");
    return JSON.parse(raw) as EstadoPagos;
  } catch {
    return null;
  }
}

async function guardarPagos(estado: EstadoPagos): Promise<void> {
  const cuerpo = JSON.stringify(estado);
  if (usaBlob) {
    const { put } = await import("@vercel/blob");
    await put(`pagos/${estado.reporteId}.json`, cuerpo, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    });
    return;
  }
  await fs.mkdir(dirLocal, { recursive: true });
  await fs.writeFile(path.join(dirLocal, `${estado.reporteId}.json`), cuerpo);
}

export async function registrarPago(
  reporteId: string,
  pago: Pago,
): Promise<EstadoPagos> {
  const estado = (await leerPagos(reporteId)) ?? {
    reporteId,
    precio: precioReporte(),
    pagos: [],
  };
  if (!estado.pagos.some((p) => p.oper === pago.oper)) {
    estado.pagos.push(pago);
    await guardarPagos(estado);
  }
  return estado;
}
