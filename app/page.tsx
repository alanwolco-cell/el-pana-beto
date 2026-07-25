import Link from "next/link";

const pasos = [
  {
    numero: "01",
    titulo: "Exporta tu chat",
    texto:
      "En WhatsApp: abre el chat → toca el nombre del grupo → Exportar chat → Sin archivos. Te genera un .txt en segundos.",
  },
  {
    numero: "02",
    titulo: "Pásaselo a Beto",
    texto:
      "Sube el archivo o pega la conversación. Beto se lee cada mensaje, desde el primer «hola» hasta la última pelea.",
  },
  {
    numero: "03",
    titulo: "Recibe el veredicto",
    texto:
      "En unos minutos tienes un reporte completo: perfiles de cada uno, premios, banderas rojas y las frases que nadie quiere recordar.",
  },
];

const tipos = [
  {
    nombre: "Reporte Clásico",
    texto:
      "Beto analiza un chat con humor y cero filtro. El favorito para grupos de panas, familia y el chat del trabajo.",
    etiqueta: "El más pedido",
  },
  {
    nombre: "Reporte Profundo",
    texto:
      "Menos chiste, más verdad. Un análisis introspectivo de las dinámicas reales del grupo: quién carga el chat, quién desapareció, qué no se está diciendo.",
    etiqueta: "Para valientes",
  },
  {
    nombre: "El Espejo",
    texto:
      "Beto compara varias conversaciones tuyas y encuentra tus patrones: cómo cambias según con quién hablas.",
    etiqueta: "Próximamente",
  },
];

const secciones = [
  "El veredicto general del grupo",
  "Perfil y apodo de cada integrante",
  "Premios y reconocimientos",
  "Diccionario del grupo (su vocabulario interno)",
  "Banderas verdes y banderas rojas",
  "Frases célebres, con contexto",
  "Predicción de cómo va a reaccionar cada uno al reporte",
];

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 sm:pt-24">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Reportes de chats de grupo, escritos por una IA sin filtro
        </p>
        <h1 className="font-display max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          Pásale tu chat a Beto. Él dice lo que nadie se atreve.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Sube cualquier conversación de WhatsApp o iMessage. Beto se lee todos
          los mensajes y escribe un reporte con su opinión sincera de todos
          ustedes.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/nuevo"
            className="rounded-full bg-accent px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            Pedir mi reporte
          </Link>
          <p className="text-sm text-muted">
            5 min para exportar · 5 min para el reporte
          </p>
        </div>
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-3">
          {pasos.map((p) => (
            <div key={p.numero}>
              <p className="text-sm font-semibold text-accent">{p.numero}</p>
              <h2 className="font-display mt-2 text-2xl font-semibold">
                {p.titulo}
              </h2>
              <p className="mt-3 leading-relaxed text-muted">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          Tres formas de conocer la verdad
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {tipos.map((t) => (
            <article
              key={t.nombre}
              className="flex flex-col rounded-lg border border-line bg-card p-6"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-accent">
                {t.etiqueta}
              </p>
              <h3 className="font-display mt-3 text-xl font-semibold">
                {t.nombre}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t.texto}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Qué trae el reporte
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              No es un resumen. Es la opinión de un pana que se leyó todo y
              tiene mucho que decir.
            </p>
            <Link
              href="/nuevo"
              className="mt-8 inline-block rounded-full border border-ink px-6 py-3 font-medium transition-colors hover:bg-ink hover:text-paper"
            >
              Empezar ahora
            </Link>
          </div>
          <ul className="space-y-4">
            {secciones.map((s) => (
              <li
                key={s}
                className="flex items-baseline gap-3 border-b border-line pb-4"
              >
                <span className="text-accent">—</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
