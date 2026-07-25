import Image from "next/image";
import Link from "next/link";
import {
  ChatIMessage,
  ChatWhatsApp,
  VeredictoBeto,
} from "./chat-demo";

const pasos = [
  {
    numero: "01",
    titulo: "Exporta tu chat",
    texto:
      "En WhatsApp: abre el grupo → toca el nombre → Exportar chat → Sin archivos. Te genera un .txt en segundos. En iMessage también sirve.",
  },
  {
    numero: "02",
    titulo: "Pásaselo a Beto",
    texto:
      "Sube el archivo o pega la conversación. Beto se lee todo el bochinche, desde el primer «xopá» hasta la última pelea.",
  },
  {
    numero: "03",
    titulo: "Recibe el veredicto",
    texto:
      "En unos minutos tienes el reporte completo: perfiles con apodo, premios, banderas rojas y las frases que nadie quiere recordar.",
  },
];

const tipos = [
  {
    nombre: "Reporte Clásico",
    texto:
      "Humor al frente y verdades bien puestas. El favorito para el grupo de los frenes, la familia y el chat del trabajo.",
    etiqueta: "El más pedido",
  },
  {
    nombre: "Reporte Profundo",
    texto:
      "Menos chiste, más verdad. Quién carga el grupo, quién se desapareció, qué no se está diciendo. Como conversación seria de 2 a.m.",
    etiqueta: "Para valientes",
  },
  {
    nombre: "El Espejo",
    texto:
      "No es sobre un chat: es sobre ti. Beto compara varias conversaciones tuyas y encuentra cómo cambias según con quién hablas.",
    etiqueta: "Próximamente",
  },
];

const reacciones = [
  {
    emoji: "👨‍👩‍👧",
    grupo: "La familia",
    burbujas: ["JAJAJA lo del carro 'en el taller' me mató 💀", "mi mamá lo leyó dos veces y lo reenvió"],
  },
  {
    emoji: "🍻",
    grupo: "Los frenes",
    burbujas: ["¿QUIÉN LE DIO EL CHAT A ESTE SEÑOR?", "el apodo que me puso... no lo supero"],
  },
  {
    emoji: "💼",
    grupo: "El trabajo",
    burbujas: ["esto NO puede llegar al jefe 😭", "muy tarde, ya lo leyó"],
  },
  {
    emoji: "🎓",
    grupo: "El grupo de la U",
    burbujas: ["me siento atacada pero todo es verdad", "Beto no falla"],
  },
  {
    emoji: "💔",
    grupo: "La ex",
    burbujas: ["ok esto dolió más que la ruptura", "te lo dije desde el principio jaja"],
  },
  {
    emoji: "🤝",
    grupo: "El casi algo",
    burbujas: ["'situación sin título desde 2024' JAJAJA", "hasta Beto sabe que no somos nada"],
  },
];

const preguntas = [
  {
    p: "¿Quién es Beto?",
    r: "Una IA con alma de tío panameño: se lee tu chat completo, sin filtro y sin pena ajena. No existe de verdad, pero opina como si hubiera estado en el grupo desde el 2015.",
  },
  {
    p: "¿Qué chats sirven?",
    r: "Todos: la familia, los frenes, el trabajo, la U, la ex, el casi algo. Mientras más bochinche, mejor sale el reporte.",
  },
  {
    p: "¿Qué apps soporta?",
    r: "WhatsApp y iMessage. En WhatsApp exportas el chat con la opción «Sin archivos» y te genera un .txt listo para subir.",
  },
  {
    p: "¿Cuánto tarda?",
    r: "Buco rápido: unos 5 minutos exportando de tu lado, y otros 5 mientras Beto lee todo y escribe el reporte.",
  },
  {
    p: "¿Es seguro compartir mi chat?",
    r: "El chat se procesa una sola vez para generar el reporte y no se guarda ni se usa para entrenar ningún modelo. El reporte vive en un link privado con código imposible de adivinar, que solo tiene tu grupo.",
  },
  {
    p: "¿Cómo comparto el reporte?",
    r: "Cada reporte tiene su link único. Lo mandas al grupo y que empiece el bochinche.",
  },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 sm:pt-20">
        <div className="grid items-center gap-10 sm:grid-cols-[3fr_2fr]">
          <div>
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              ¿Qué xopá? · Reportes de chats de grupo
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Pásale el chat a Beto. Él lee todo el bochinche y dice lo que
              nadie se atreve.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Sube cualquier conversación de WhatsApp o iMessage. Beto se lee
              cada mensaje y escribe un reporte con su opinión sincera de todos
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
                5 min para exportar · 5 min pa&rsquo;l reporte
              </p>
            </div>
          </div>
          <Image
            src="/beto.jpg"
            alt="Beto: un señor panameño sonriente con sombrero pintado y guayabera"
            width={450}
            height={450}
            priority
            className="mx-auto w-full max-w-xs rounded-2xl border border-line shadow-sm sm:max-w-none"
          />
        </div>
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Así se ve cuando Beto opina
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <ChatWhatsApp
                titulo="Familia Quintero 🇵🇦"
                subtitulo="Mamá, Tía Mirna, Papo, tú y 9 más"
                mensajes={[
                  {
                    de: "Tía Mirna",
                    colorDe: "text-[#c2618c]",
                    texto:
                      "Buenos días familia bella 🌹 Dios les bendiga este martes hermoso 🙏",
                    hora: "6:02 a.m.",
                  },
                  {
                    de: "Mamá",
                    colorDe: "text-[#7a67ce]",
                    texto: "El domingo sancocho en casa. Confirmen.",
                    hora: "9:14 a.m.",
                  },
                  {
                    de: "Papo",
                    colorDe: "text-[#4c9ce0]",
                    texto: "confirmo si alguien me da ride desde Arraiján",
                    hora: "9:20 a.m.",
                  },
                  {
                    de: "Mamá",
                    colorDe: "text-[#7a67ce]",
                    texto: "Papo tú tienes carro",
                    hora: "9:21 a.m.",
                  },
                  {
                    de: "Papo",
                    colorDe: "text-[#4c9ce0]",
                    texto: "está en el taller desde marzo mami",
                    hora: "9:21 a.m.",
                  },
                  { texto: "yo llevo el pan 🙋", hora: "9:30 a.m.", propia: true },
                ]}
              />
              <VeredictoBeto>
                La tía Mirna manda bendiciones a las 6 a.m. con una disciplina
                que ya quisiera el Metro. Y ojo: el carro de Papo lleva cuatro
                meses «en el taller». Ese carro no existe, familia.
              </VeredictoBeto>
            </div>
            <div>
              <ChatIMessage
                titulo="Los Frenes 🍻"
                mensajes={[
                  { de: "Kike", texto: "fren la playa este sábado o qué" },
                  {
                    de: "Nando",
                    texto: "me apunto pero ando limpio hasta la quincena",
                  },
                  { de: "Kike", texto: "Nando tú SIEMPRE andas limpio" },
                  { texto: "hagamos la vaca y ya", propia: true },
                  { de: "Nando", texto: "ofi 🤝" },
                  {
                    de: "Kike",
                    texto: "eso mismo dijeron pa' Semana Santa y nadie fue",
                  },
                ]}
              />
              <VeredictoBeto>
                Este grupo planea más viajes que Copa y ejecuta menos que Nando
                en quincena. La «vaca» es el único plan que sobrevive aquí — y
                eso porque la organiza otra gente.
              </VeredictoBeto>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-10 sm:grid-cols-3">
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

      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            La gente reaccionando a su reporte
          </h2>
          <p className="mt-3 text-muted">
            Lo que pasa en el grupo cuando alguien suelta el link.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reacciones.map((r) => (
              <article
                key={r.grupo}
                className="rounded-lg border border-line bg-paper p-5"
              >
                <p className="text-sm font-semibold">
                  <span className="mr-2">{r.emoji}</span>
                  {r.grupo}
                </p>
                <div className="mt-4 space-y-2">
                  {r.burbujas.map((b, i) => (
                    <p
                      key={b}
                      className={`w-fit max-w-full rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                        i % 2
                          ? "ml-auto bg-[#d9fdd3] text-[#111b21]"
                          : "bg-white text-[#111b21] shadow-sm"
                      }`}
                    >
                      {b}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
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
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-widest text-accent">
                  {t.etiqueta}
                </p>
                <Image
                  src="/beto.jpg"
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full border border-line object-cover"
                />
              </div>
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
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Preguntas que todo el mundo hace
          </h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {preguntas.map((q) => (
              <details key={q.p} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {q.p}
                  <span className="ml-4 text-accent transition-transform group-open:rotate-45">
                    ＋
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{q.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <Image
            src="/beto.jpg"
            alt="Beto"
            width={72}
            height={72}
            className="mx-auto rounded-full border border-line object-cover"
          />
          <h2 className="font-display mt-6 text-3xl font-semibold sm:text-4xl">
            ¿Cuál chat va primero?
          </h2>
          <div className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-2">
            {reacciones.map((r) => (
              <span
                key={r.grupo}
                className="rounded-full border border-line bg-paper px-4 py-1.5 text-sm"
              >
                {r.emoji} {r.grupo}
              </span>
            ))}
          </div>
          <Link
            href="/nuevo"
            className="mt-10 inline-block rounded-full bg-accent px-8 py-4 font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            Pedir mi reporte
          </Link>
        </div>
      </section>
    </>
  );
}
