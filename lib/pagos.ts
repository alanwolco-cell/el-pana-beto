import { promises as fs } from "fs";
import path from "path";
import { guardar, hayPostgres, seleccionar } from "./datos";

export type Pago = {
  oper: string;
  monto: number;
  nombre: string;
  fecha: string;
  plan?: string;
};

export type EstadoPagos = {
  reporteId: string;
  precio: number;
  pagos: Pago[];
  cupones?: string[];
  codigoPana?: string;
};

export const PLANES = {
  basico: { nombre: "1 Reporte", precioBase: 4.99, cupones: 0, cancion: false },
  doblete: { nombre: "Combo Beto", precioBase: 7.99, cupones: 0, cancion: true },
  expediente: { nombre: "Modo Leyenda", precioBase: 9.99, cupones: 1, cancion: true },
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
  return Number.isFinite(p) && p > 0 ? p : 1;
}
export const USOS_PARA_CORTESIA = 3;

export function pagosConfigurados(): boolean {
  return !!process.env.PF_CCLW;
}

// Código maestro de cortesía (solo para el dueño): desbloquea cualquier
// reporte gratis y es REUTILIZABLE. Vive en env (CODIGO_CORTESIA) para que no
// quede en el repo. Devuelve "" si no está configurado.
export function codigoCortesia(): string {
  return (process.env.CODIGO_CORTESIA ?? "").trim().toUpperCase();
}

// Comisión de PagueloFacil (configurable por env). En la vaca, cada persona
// cubre su parte para que a Wolco le llegue completo el precio del reporte.
export function comisionConfig(): { pct: number; fija: number } {
  const pct = Number(process.env.PF_COMISION_PORC);
  const fija = Number(process.env.PF_COMISION_FIJA);
  return {
    pct: Number.isFinite(pct) && pct >= 0 ? pct : 0.05,
    fija: Number.isFinite(fija) && fija >= 0 ? fija : 0.35,
  };
}

export function comisionPagueloFacil(monto: number): number {
  const { pct, fija } = comisionConfig();
  return Math.round((monto * pct + fija) * 100) / 100;
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

// Confirma una transacción antes de registrar el pago.
// - Con PF_QUERY_URL configurado: consulta el estado real por Oper (ideal).
// - Sin él: confía en la confirmación que PagueloFacil manda al RETURN_URL
//   (Estado=Aprobada + Oper + Total), ya validada en la ruta de retorno.
//   Para forzar un desbloqueo habría que conocer un reporteId (UUID privado
//   que solo tiene el grupo) — riesgo bajo. La verificación fuerte llega
//   cuando se active el webhook firmado de PagueloFacil (recomendado).
export async function verificarTransaccion(
  oper: string,
  monto: number,
): Promise<boolean> {
  const endpoint = process.env.PF_QUERY_URL;
  if (!endpoint) {
    if (process.env.PF_SANDBOX === "1") return true;
    // Producción sin endpoint de consulta: confiar en el retorno de PF.
    return pagosConfigurados() && !!oper && monto > 0;
  }
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        CCLW: process.env.PF_CCLW ?? "",
        oper,
      }).toString(),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const estado = String(
      data?.data?.status ?? data?.status ?? "",
    ).toLowerCase();
    const totalReal = Number(data?.data?.total ?? data?.total ?? 0);
    const aprobado =
      estado === "1" || estado.includes("aprob") || estado.includes("approv");
    // El monto confirmado por el gateway debe cubrir lo registrado.
    return aprobado && totalReal >= monto - 0.05;
  } catch (e) {
    console.error("Error verificando transacción PagueloFacil:", e);
    return false;
  }
}

// La canción se paga aparte: sus pagos no cuentan para la vaca del reporte.
export function totalPagado(estado: EstadoPagos): number {
  return estado.pagos
    .filter((p) => p.plan !== "cancion")
    .reduce((s, p) => s + p.monto, 0);
}

export function precioCancion(): number {
  const p = Number(process.env.PRECIO_CANCION);
  return Number.isFinite(p) && p >= 1 ? p : 3.49;
}

// El Combo Beto y el Modo Leyenda ya traen la canción incluida.
export function planIncluyeCancion(plan?: string): boolean {
  return !!plan && plan in PLANES && PLANES[plan as Plan].cancion;
}

export function cancionComprada(estado: EstadoPagos | null): boolean {
  if (!pagosConfigurados()) return true;
  return !!estado?.pagos.some(
    (p) => p.plan === "cancion" || planIncluyeCancion(p.plan),
  );
}

export function estaDesbloqueado(estado: EstadoPagos | null): boolean {
  if (!pagosConfigurados()) return true;
  if (!estado) return false;
  // margen de 5 centavos por redondeos al dividir la vaca
  return totalPagado(estado) >= estado.precio - 0.05;
}

// Mapa de prefijo -> tabla de Postgres. Los que no estan en el mapa siguen
// por el camino viejo (Blob o disco): asi se migra lo que tiene datos de
// clientes sin tocar el resto.
const TABLAS: Record<string, { tabla: string; pk: string }> = {
  pagos: { tabla: "pagos", pk: "reporte_id" },
  referidos: { tabla: "referidos", pk: "codigo" },
};

// Fila de Postgres -> la forma que el resto del archivo espera, y al reves.
const desdeFila = (prefijo: string, f: Record<string, unknown>) =>
  prefijo === "pagos"
    ? { reporteId: f.reporte_id, precio: Number(f.precio), pagos: f.pagos ?? [], codigoPana: f.codigo_pana ?? undefined }
    : { origen: f.origen ?? undefined, usos: Number(f.usos) || 0 };

const haciaFila = (prefijo: string, clave: string, v: Record<string, unknown>) =>
  prefijo === "pagos"
    ? { reporte_id: clave, precio: v.precio ?? 0, pagos: v.pagos ?? [], codigo_pana: v.codigoPana ?? null }
    : { codigo: clave, origen: v.origen ?? null, usos: v.usos ?? 0 };

async function leerJson<T>(prefijo: string, dir: string, clave: string): Promise<T | null> {
  const destino = TABLAS[prefijo];
  if (destino && hayPostgres()) {
    try {
      const filas = await seleccionar<Record<string, unknown>>(
        destino.tabla,
        `select=*&${destino.pk}=eq.${encodeURIComponent(clave)}&limit=1`,
      );
      return filas[0] ? (desdeFila(prefijo, filas[0]) as T) : null;
    } catch (e) {
      console.error(`[pagos] leer ${prefijo}:`, (e as Error).message);
      return null;
    }
  }
  if (usaBlob) {
    // CLAVE: get({useCache:false}) lee directo del ORIGEN. Antes se usaba
    // list()+fetch de la URL pública: list es eventualmente consistente para
    // blobs nuevos y el fetch venía del CDN — el gate de generación podía ver
    // "no pagado" un buen rato después de pagar, y un cupón marcado usado
    // seguía apareciendo como libre. Mismo bug (y mismo fix) que storage.ts.
    const { get } = await import("@vercel/blob");
    const res = await get(`${prefijo}/${clave}.json`, {
      access: "public",
      useCache: false,
    });
    if (!res || res.statusCode !== 200 || !res.stream) return null;
    try {
      return JSON.parse(await new Response(res.stream).text()) as T;
    } catch {
      return null;
    }
  }
  try {
    return JSON.parse(await fs.readFile(path.join(dir, `${clave}.json`), "utf8")) as T;
  } catch {
    return null;
  }
}

async function guardarJson(prefijo: string, dir: string, clave: string, valor: unknown): Promise<void> {
  const destino = TABLAS[prefijo];
  if (destino && hayPostgres()) {
    // Sin try/catch a proposito: si un pago no se guarda, quien llama tiene
    // que enterarse. Tragarse este error significa cobrar y no registrarlo.
    await guardar(
      destino.tabla,
      haciaFila(prefijo, clave, valor as Record<string, unknown>),
      destino.pk,
    );
    return;
  }
  const cuerpo = JSON.stringify(valor);
  if (usaBlob) {
    const { put } = await import("@vercel/blob");
    await put(`${prefijo}/${clave}.json`, cuerpo, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
      // Blobs MUTABLES (pagos que suman, cupones que se marcan usados): sin
      // esto el CDN los cachea ~1 mes y las lecturas públicas ven el pasado.
      cacheControlMaxAge: 60,
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
