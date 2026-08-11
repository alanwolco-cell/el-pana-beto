// Prueba "pagó y cerró la pestaña": create → canje → SOLO observar (jamás se
// llama al respaldo). El reporte debe terminar únicamente por la cadena
// server-side (waitUntil + eslabones encadenados). Si esto pasa, nadie
// necesita la página abierta ni un botón de reintentar.
import { readFileSync } from "fs";

const BASE = "https://elpanabeto.com";
const [, , rutaChat, codigo] = process.argv;
const chat = readFileSync(rutaChat, "utf8");
const nombres = ["Rufino", "Chelo", "Pipo", "Tita", "Moncho", "La Negra"];
const participantes = nombres.map((n) => ({
  nombre: n,
  mensajes: (chat.match(new RegExp(`\\] ${n}:`, "g")) || []).length,
}));
const marca = () => new Date().toISOString().slice(11, 19);
const log = (...a) => console.log(`[${marca()}]`, ...a);

const { id } = await (
  await fetch(`${BASE}/api/reportes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grupo: "Prueba Pestana Cerrada",
      tipo: "clasico",
      chat,
      mensajes: participantes.reduce((a, p) => a + p.mensajes, 0),
      contexto: "Grupo de panas",
      nombreUsuario: "Tita",
      intensidad: "normal",
      participantes,
    }),
  })
).json();
log("create →", id);

const canje = await (
  await fetch(`${BASE}/api/pagos/canjear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reporteId: id, codigo }),
  })
).json();
if (!canje.ok) {
  console.error("CANJE FALLÓ:", canje);
  process.exit(1);
}
const t0 = Date.now();
log("canje ok — a partir de aquí SOLO se observa (cero respaldos)");

let anterior = "";
for (let i = 0; i < 180; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  let e = "sin-red";
  try {
    e = (
      await (
        await fetch(`${BASE}/api/reportes/estado?id=${id}&_=${Date.now()}`, {
          cache: "no-store",
        })
      ).json()
    ).estado;
  } catch {}
  if (e !== anterior) {
    log(`estado: ${e} (t=${Math.round((Date.now() - t0) / 1000)}s)`);
    anterior = e;
  }
  if (e === "listo" || e === "error") break;
}
const blob = await (
  await fetch(
    `https://pggxy9kijbhwugdq.public.blob.vercel-storage.com/reportes/${id}.json?x=${Date.now()}`,
  )
).json();
const md = blob.reporteMd ?? "";
log(
  `FINAL: estado=${blob.estado} | palabras=${md ? md.split(/\s+/).length : 0} | inputs borrados=${!blob.inputs ? "✅" : "❌"} | reintentos=${blob.reintentos ?? 0} | errores=${JSON.stringify(blob.errores ?? [])}`,
);
log(
  `sin la página abierta: ${blob.estado === "listo" ? "✅ TERMINÓ SOLO" : "❌ NO TERMINÓ"}`,
);
console.log("URL:", `${BASE}/r/${id}`);
process.exit(blob.estado === "listo" ? 0 : 1);
