// E2E del flujo v2 (pagar → generar) contra PRODUCCIÓN, con un chat sintético.
// Uso: node scripts/e2e-flujo-v2.mjs /ruta/chat.txt CODIGO
// Fases: create ($0) → teaser/estado pendiente ($0) → intento de generar sin
// pagar (debe rebotar, $0) → canje del código → polling con respaldo (emula al
// cliente) → validación del reporte (canon plantado) → medición de tiempos.
import { readFileSync } from "fs";

const BASE = "https://elpanabeto.com";
const [, , rutaChat, codigo] = process.argv;
if (!rutaChat || !codigo) {
  console.error("uso: node e2e-flujo-v2.mjs <chat.txt> <CODIGO>");
  process.exit(1);
}
const chat = readFileSync(rutaChat, "utf8");
const nombres = ["Rufino", "Chelo", "Pipo", "Tita", "Moncho", "La Negra"];
const participantes = nombres.map((n) => ({
  nombre: n,
  mensajes: (chat.match(new RegExp(`\\] ${n}:`, "g")) || []).length,
}));
const totalMsjs = participantes.reduce((a, p) => a + p.mensajes, 0);
const marca = () => new Date().toISOString().slice(11, 19);
const log = (...a) => console.log(`[${marca()}]`, ...a);

// 1) CREATE — debe responder rápido y NO generar nada.
let t0 = Date.now();
const crear = await fetch(`${BASE}/api/reportes`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grupo: "Prueba Sistema Beto",
    tipo: "clasico",
    chat,
    mensajes: totalMsjs,
    contexto: "Grupo de panas",
    nombreUsuario: "Rufino",
    intensidad: "normal",
    participantes,
  }),
});
const { id, error } = await crear.json();
if (!id) { console.error("CREATE FALLÓ:", error); process.exit(1); }
log(`create ok en ${Date.now() - t0}ms → id=${id}`);

// 2) Estado debe ser "pendiente" y la página debe mostrar el teaser.
const estado = async () => {
  try {
    return (await (await fetch(`${BASE}/api/reportes/estado?id=${id}&_=${Date.now()}`, { cache: "no-store" })).json()).estado;
  } catch {
    return "red-caida"; // blip de red local: no matar la prueba
  }
};
const e1 = await estado();
log(`estado inicial: ${e1} ${e1 === "pendiente" ? "✅" : "❌ (esperaba pendiente)"}`);
const html = await (await fetch(`${BASE}/r/${id}`)).text();
const tieneTeaser = html.includes("El expediente de");
const tienePanel = html.includes("lápiz en la mano");
const diceGratis = /\bgratis\b/i.test(html);
log(`teaser: ${tieneTeaser ? "✅" : "❌"} | panel v2: ${tienePanel ? "✅" : "❌"} | dice 'gratis': ${diceGratis ? "❌ SÍ" : "✅ no"}`);

// 3) GATE: generar sin pagar debe rebotar sin gastar.
const g1 = await (await fetch(`${BASE}/api/reportes/generar`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id }),
})).json();
log(`generar sin pagar → "${g1.estado}" ${g1.estado === "pendiente" ? "✅ (no gastó)" : "❌ PELIGRO"}`);
if (g1.estado !== "pendiente") process.exit(1);

// 4) CANJE del código (dispara la generación real — aquí empieza el gasto).
t0 = Date.now();
const canje = await (await fetch(`${BASE}/api/pagos/canjear`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ reporteId: id, codigo }),
})).json();
if (!canje.ok) { console.error("CANJE FALLÓ:", canje); process.exit(1); }
log("canje ok — generación disparada");

// 5) Polling como el cliente real: estado cada 5s, respaldo cada ~135s.
let ultimoRespaldo = Date.now();
let anterior = "";
for (let seg = 0; seg < 900; seg += 5) {
  await new Promise((r) => setTimeout(r, 5000));
  const e = await estado();
  if (e !== anterior) { log(`estado: ${e} (t=${Math.round((Date.now() - t0) / 1000)}s)`); anterior = e; }
  if (e === "listo") break;
  if (Date.now() - ultimoRespaldo > 135_000 && e !== "red-caida") {
    ultimoRespaldo = Date.now();
    try {
      const g = await (await fetch(`${BASE}/api/reportes/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })).json();
      log(`respaldo → ${g.estado}`);
    } catch {
      log("respaldo falló por red — sigo");
    }
  }
}
const total = Math.round((Date.now() - t0) / 1000);

// 6) Validar el resultado directo del blob.
const blob = await (await fetch(`https://pggxy9kijbhwugdq.public.blob.vercel-storage.com/reportes/${id}.json?x=${Date.now()}`)).json();
const md = blob.reporteMd ?? "";
log(`── RESULTADO en ${total}s ──`);
log(`estado final: ${blob.estado} | palabras: ${md.split(/\s+/).length}`);
log(`inputs borrados: ${!blob.inputs ? "✅" : "❌ SIGUEN AHÍ"}`);
log(`errores registrados: ${JSON.stringify(blob.errores ?? [])}`);
const cuenta = (re) => (md.match(re) || []).length;
log(`canon → ceviche: ${cuenta(/ceviche/gi)} menciones ${cuenta(/ceviche/gi) >= 3 ? "✅" : "❌"} | deuda/bingo/40: ${cuenta(/bingo|\$ ?40|cuarenta/gi)} ${cuenta(/bingo|\$?40|cuarenta/gi) >= 1 ? "✅" : "❌"} | gym Pipo: ${cuenta(/gym/gi)} ${cuenta(/gym/gi) >= 1 ? "✅" : "❌"}`);
log(`título: ${(md.split("\n")[0] || "").slice(0, 120)}`);
log(`secciones: ${[...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]).join(" · ")}`);
log(`comillas angulares «»: ${/«|»/.test(md) ? "❌ aparecen" : "✅ ninguna"}`);
console.log("\nURL:", `${BASE}/r/${id}`);
