// Continúa el E2E del flujo v2 para un reporte ya disparado: poll resistente a
// fallos de red + respaldo idempotente + validación final del canon.
const BASE = "https://elpanabeto.com";
const id = process.argv[2];
const t0 = Date.now();
const marca = () => new Date().toISOString().slice(11, 19);
const log = (...a) => console.log(`[${marca()}]`, ...a);

async function intenta(fn, porDefecto) {
  try {
    return await fn();
  } catch {
    return porDefecto;
  }
}
const estado = () =>
  intenta(
    async () =>
      (
        await (
          await fetch(`${BASE}/api/reportes/estado?id=${id}&_=${Date.now()}`, {
            cache: "no-store",
          })
        ).json()
      ).estado,
    "red-caida",
  );

let ultimoRespaldo = Date.now();
let anterior = "";
let e = "";
for (let i = 0; i < 200; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  e = await estado();
  if (e !== anterior) {
    log(`estado: ${e} (t=+${Math.round((Date.now() - t0) / 1000)}s)`);
    anterior = e;
  }
  if (e === "listo") break;
  if (Date.now() - ultimoRespaldo > 135_000 && e !== "red-caida") {
    ultimoRespaldo = Date.now();
    const g = await intenta(
      async () =>
        (
          await (
            await fetch(`${BASE}/api/reportes/generar`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            })
          ).json()
        ).estado,
      "red-caida",
    );
    log(`respaldo → ${g}`);
  }
}

const blob = await intenta(
  async () =>
    await (
      await fetch(
        `https://pggxy9kijbhwugdq.public.blob.vercel-storage.com/reportes/${id}.json?x=${Date.now()}`,
      )
    ).json(),
  null,
);
if (!blob) {
  console.error("No pude leer el blob final");
  process.exit(1);
}
const md = blob.reporteMd ?? "";
log(`── RESULTADO ──`);
log(`estado final: ${blob.estado} | palabras: ${md ? md.split(/\s+/).length : 0}`);
log(`inputs borrados: ${!blob.inputs ? "✅" : "❌ SIGUEN AHÍ"}`);
log(`errores registrados: ${JSON.stringify(blob.errores ?? [])}`);
if (md) {
  const cuenta = (re) => (md.match(re) || []).length;
  log(
    `canon → ceviche: ${cuenta(/ceviche/gi)} ${cuenta(/ceviche/gi) >= 3 ? "✅" : "❌"} | deuda/bingo: ${cuenta(/bingo|\$ ?40|cuarenta|deuda/gi)} ${cuenta(/bingo|\$ ?40|cuarenta|deuda/gi) >= 1 ? "✅" : "❌"} | gym: ${cuenta(/gym/gi)} ${cuenta(/gym/gi) >= 1 ? "✅" : "❌"}`,
  );
  log(`título: ${(md.split("\n")[0] || "").slice(0, 130)}`);
  log(
    `secciones: ${[...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]).join(" · ")}`,
  );
  log(`comillas angulares: ${/«|»/.test(md) ? "❌ aparecen" : "✅ ninguna"}`);
}
console.log("URL:", `${BASE}/r/${id}`);
process.exit(blob.estado === "listo" || md ? 0 : 1);
