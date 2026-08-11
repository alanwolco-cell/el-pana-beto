// Acceso a Postgres (Supabase) por su API REST.
//
// Se usa REST y no conexion directa: sin contrasena de base, sin pool que
// administrar en serverless, y la service_role key ya vive en las variables de
// entorno de Vercel.
//
// service_role salta RLS por diseno. Este archivo solo debe importarse desde
// codigo de servidor: nunca desde un componente cliente.

import "server-only";

const URL_BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ESQUEMA = "chats";

export const hayPostgres = () => !!(URL_BASE && KEY);

function cabeceras(extra: Record<string, string> = {}) {
  return {
    apikey: KEY as string,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    // PostgREST elige el esquema por cabecera. Sin esto pega contra "public".
    "Accept-Profile": ESQUEMA,
    "Content-Profile": ESQUEMA,
    ...extra,
  };
}

async function pedir(ruta: string, opciones: RequestInit = {}, ms = 8000) {
  if (!hayPostgres()) throw new Error("SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY sin configurar");

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(`${URL_BASE}/rest/v1/${ruta}`, {
      ...opciones,
      headers: cabeceras(opciones.headers as Record<string, string>),
      signal: ctrl.signal,
      // Nunca cachear: estas filas mutan (generando -> listo, pagos que suman).
      // Era justo el bug que el CDN de Blob causaba antes.
      cache: "no-store",
    });
    const texto = await r.text();
    if (!r.ok) throw new Error(`supabase ${r.status}: ${texto.slice(0, 300)}`);
    return texto ? JSON.parse(texto) : null;
  } finally {
    clearTimeout(t);
  }
}

export async function seleccionar<T>(tabla: string, query: string): Promise<T[]> {
  return (await pedir(`${tabla}?${query}`, { method: "GET" })) ?? [];
}

export async function guardar(
  tabla: string,
  filas: unknown,
  conflicto?: string,
): Promise<void> {
  await pedir(`${tabla}${conflicto ? `?on_conflict=${conflicto}` : ""}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(Array.isArray(filas) ? filas : [filas]),
  });
}
