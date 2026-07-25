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
  cupones?: string[];
  codigoPana?: string;
};

export const PLANES = {
  basico: { nombre: "El Reporte", precioBase: 7.99, cupones: 0 },
  doblete: { nombre: "El Doblete", precioBase: 13.99, cupones: 1 },
  expediente: { nombre: "El Expediente", precioBase: 24.99, cupones: 4 },
} as const;

export type Plan = keyof typeof PLANES;

const usaBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const dirPagos = path.join(process.cwd(), ".data", "pagos");
const dirCupones = path.join(process.cwd(), ".data", "cupones");
const dirReferidos = path.join(process.cwd(), ".data", "referidos");

// Descuento que regala un "código de pana" y usos necesarios para
// ganarse un reporte de cortesía.
export function descuentoReferido(): number {
  const p = Number(process.env.DESCUENTO_REFERIDO);
  return Number.isFinite(p) && p > 0 ? p : 2;
}
export const USOS_PARA_CORTESIA = 3;

export function pagosConfigurados(): boolean {
  return !!process.env.PF_CCLW;
}

export function precioPlan(plan: Plan): number {
  const env = {
    basico: process.env.PRECIO_BASICO,
    doblete: process.env.PRECIO_DOBLETE,
    expediente: process.env.PRECIO_EXPEDIENTE,
  }[plan];
  const p = Number(env);
  return Number.isFinite(p) && p >= 1 ? p : PLANES[plan].precioBase;
}

// Umbral que desbloquea un reporte: el precio del plan básico.
export function precioDesbloqueo(): number {
  return precioPlan("basico");
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
  // margen de 5 centavos por redondeos al dividir la vaca
  return totalPagado(estado) >= estado.precio - 0.05;
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

export async function leerPagos(reporteId: string): Promise<EstadoPagos | null> {
  return leerJson<EstadoPagos>("pagos", dirPagos, reporteId);
}

export async function guardarPagos(estado: EstadoPagos): Promise<void> {
  await guardarJson("pagos", dirPagos, estado.reporteId, estado);
}

export async function registrarPago(
  reporteId: string,
  pago: Pago,
  precio: number,
): Promise<{ estado: EstadoPagos; nuevo: boolean }> {
  const estado = (await leerPagos(reporteId)) ?? {
    reporteId,
    precio,
    pagos: [],
  };
  if (estado.pagos.some((p) => p.oper === pago.oper)) {
    return { estado, nuevo: false };
  }
  estado.pagos.push(pago);
  await guardarPagos(estado);
  return { estado, nuevo: true };
}

type Cupon = { origen: string; usado: boolean };

function generarCodigo(): string {
  return `BETO-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function crearCupones(
  reporteId: string,
  cantidad: number,
): Promise<string[]> {
  const codigos: string[] = [];
  for (let i = 0; i < cantidad; i++) {
    const codigo = generarCodigo();
    await guardarJson("cupones", dirCupones, codigo, {
      origen: reporteId,
      usado: false,
    } satisfies Cupon);
    codigos.push(codigo);
  }
  const estado = await leerPagos(reporteId);
  if (estado) {
    estado.cupones = [...(estado.cupones ?? []), ...codigos];
    await guardarPagos(estado);
  }
  return codigos;
}

type Referido = { origen: string; usos: number };

export async function obtenerCodigoPana(reporteId: string): Promise<string> {
  const estado = (await leerPagos(reporteId)) ?? {
    reporteId,
    precio: precioDesbloqueo(),
    pagos: [],
  };
  if (estado.codigoPana) return estado.codigoPana;
  const codigo = `PANA-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  await guardarJson("referidos", dirReferidos, codigo, {
    origen: reporteId,
    usos: 0,
  } satisfies Referido);
  estado.codigoPana = codigo;
  await guardarPagos(estado);
  return codigo;
}

export async function validarDescuento(codigo: string): Promise<boolean> {
  const limpio = codigo.trim().toUpperCase();
  if (!/^PANA-[A-Z0-9]{8}$/.test(limpio)) return false;
  return !!(await leerJson<Referido>("referidos", dirReferidos, limpio));
}

export async function registrarUsoReferido(codigo: string): Promise<void> {
  const limpio = codigo.trim().toUpperCase();
  const r = await leerJson<Referido>("referidos", dirReferidos, limpio);
  if (!r) return;
  r.usos += 1;
  await guardarJson("referidos", dirReferidos, limpio, r);
  if (r.usos % USOS_PARA_CORTESIA === 0) {
    await crearCupones(r.origen, 1);
  }
}

export async function canjearCupon(
  codigo: string,
): Promise<"ok" | "usado" | "invalido"> {
  const limpio = codigo.trim().toUpperCase();
  if (!/^BETO-[A-Z0-9]{8}$/.test(limpio)) return "invalido";
  const cupon = await leerJson<Cupon>("cupones", dirCupones, limpio);
  if (!cupon) return "invalido";
  if (cupon.usado) return "usado";
  await guardarJson("cupones", dirCupones, limpio, { ...cupon, usado: true });
  return "ok";
}
