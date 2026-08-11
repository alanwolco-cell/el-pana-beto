import { promises as fs } from "fs";
import path from "path";
import type { ReporteGuardado } from "./schema";
import { guardar, hayPostgres, seleccionar } from "./datos";

// Sigue haciendo falta para las portadas: esas SI van a Blob a proposito,
// porque son imagenes que el navegador tiene que poder pedir directo.
const usaBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const dirLocal = path.join(process.cwd(), ".data", "reportes");

// Los reportes viven en Postgres (chats.reportes), no en Blob.
//
// Esto cierra la fuga del paywall que estaba anotada acá como pendiente. El
// motivo era real: los blobs privados no están habilitados en este store, así
// que el reporte se guardaba con access:"public" y ruta fija, y cualquiera con
// el id podía leer el JSON completo por URL directo sin pasar por el pago.
// Postgres no tiene URL pública: solo se llega con la service_role key, que
// vive en el servidor.
//
// Los dos problemas de caché que documentaba el código viejo desaparecen
// solos: no hay CDN de por medio, así que generando→listo se ve al instante.
export async function guardarReporte(reporte: ReporteGuardado): Promise<void> {
  if (hayPostgres()) {
    const { id, grupo, tipo, creado, mensajes, estado, nombreUsuario, fotoUrl, ...resto } =
      reporte as ReporteGuardado & Record<string, unknown>;

    await guardar(
      "reportes",
      {
        id,
        producto: "panabeto",
        grupo: grupo ?? null,
        tipo: tipo ?? null,
        estado: estado ?? null,
        nombre_usuario: nombreUsuario ?? null,
        foto_url: fotoUrl ?? null,
        // "mensajes" es la CANTIDAD de mensajes del chat, no el chat.
        mensajes: typeof mensajes === "number" ? mensajes : null,
        // Todo lo de forma variable junto: reporte, reporte2, reporteMd,
        // contexto, participantes, stats, errores. Son 15 claves distintas
        // repartidas entre los reportes y ninguna aparece en todos.
        contenido: resto,
        creado: creado ?? new Date().toISOString(),
      },
      "id",
    );
    return;
  }
  await fs.mkdir(dirLocal, { recursive: true });
  await fs.writeFile(path.join(dirLocal, `${reporte.id}.json`), JSON.stringify(reporte));
}

// Guarda la foto de portada (solo con Blob configurado; en local se omite).
export async function guardarFoto(
  id: string,
  dataUrl: string,
): Promise<string | undefined> {
  const m = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m || !usaBlob) return undefined;
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 4_500_000) return undefined;
  const { put } = await import("@vercel/blob");
  const blob = await put(`portadas/${id}`, buf, {
    access: "public",
    addRandomSuffix: false,
    contentType: m[1],
  });
  return blob.url;
}

export async function leerReporte(
  id: string,
): Promise<ReporteGuardado | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  if (hayPostgres()) {
    try {
      const filas = await seleccionar<Record<string, unknown>>(
        "reportes",
        `select=*&id=eq.${id}&limit=1`,
      );
      const f = filas[0];
      if (!f) return null;

      // Se rearma la forma que el resto de la app espera: las columnas
      // vuelven a su nombre original y "contenido" se desarma encima.
      return {
        ...(f.contenido as Record<string, unknown>),
        id: f.id,
        grupo: f.grupo,
        tipo: f.tipo,
        estado: f.estado,
        nombreUsuario: f.nombre_usuario,
        fotoUrl: f.foto_url,
        mensajes: f.mensajes,
        creado: f.creado,
      } as unknown as ReporteGuardado;
    } catch (e) {
      console.error("[storage] leerReporte:", (e as Error).message);
      return null;
    }
  }
  try {
    const raw = await fs.readFile(path.join(dirLocal, `${id}.json`), "utf8");
    return JSON.parse(raw) as ReporteGuardado;
  } catch {
    return null;
  }
}
