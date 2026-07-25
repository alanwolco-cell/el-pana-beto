import Image from "next/image";
import Link from "next/link";
import { ChatWhatsAppDark, VeredictoBeto } from "./chat-demo";

const pasos = [
  {
    numero: "01",
    titulo: "Exporta tu chat",
    texto:
      "En WhatsApp: abre el grupo → toca el nombre → Exportar chat → Sin archivos. Te genera un .txt en segundos.",
  },
  {
    numero: "02",
    titulo: "Pásaselo a Beto",
    texto:
      "Sube el archivo o pega la conversación. Beto se lee todo el bochinche, desde el primer «xopá» hasta la última pelea — las épocas viejas también cuentan.",
  },
  {
    numero: "03",
    titulo: "Recibe el veredicto",
    texto:
      "En unos minutos Beto te entrega su opinión: perfiles con apodo, premios, banderas rojas y las frases que nadie quiere recordar.",
  },
];

const contenido = [
  { emoji: "🔥", titulo: "Los temas del grupo", desc: "Esas obsesiones que ustedes juran que son normales." },
  { emoji: "👤", titulo: "Un perfil por cabeza", desc: "Con el apodo que cada quien se ganó a pulso." },
  { emoji: "🏆", titulo: "Los premios", desc: "Del que no suelta el chat al que solo revive en los cumpleaños." },
  { emoji: "✨", titulo: "El ranking de aura", desc: "Quién la tiene infinita y quién quedó debiendo." },
  { emoji: "🗣️", titulo: "El diccionario", desc: "Esos inside jokes que nadie de afuera entiende." },
  { emoji: "🚩", titulo: "Las banderas", desc: "Green flags y red flags, con los recibos en mano." },
  { emoji: "🤯", titulo: "Frases célebres", desc: "Textuales, con contexto y sin filtro." },
  { emoji: "🔮", titulo: "Predicciones", desc: "Cómo va a reaccionar cada uno cuando lea esto." },
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
    r: "WhatsApp — que es donde vive el bochinche de verdad. Exportas el chat con la opción «Sin archivos» y te genera un .txt listo para subir.",
  },
  {
    p: "¿Cuánto tarda?",
    r: "Buco rápido: unos minutos exportando de tu lado, y unos 3 mientras Beto lee todo y escribe.",
  },
  {
    p: "¿Es seguro compartir mi chat?",
    r: "El chat se procesa una sola vez para escribir el reporte, se descarta y nunca se usa para entrenar ningún modelo. El reporte vive en un link privado con código imposible de adivinar, que solo tiene tu grupo. Tratamos tus datos conforme a la Ley 81 de 2019 de Panamá.",
  },
  {
    p: "¿Cómo comparto el reporte?",
    r: "Cada reporte tiene su link único. Lo mandas al grupo y que empiece el bochinche.",
  },
  {
    p: "¿Y si necesito ayuda?",
    r: "Escríbenos a elpanabeto.com@gmail.com — sí, el correo lleva el .com adentro: compramos el dominio y nos emocionamos. Beto no contesta correos (está leyendo chats), pero su equipo sí.",
  },
];

const reaccionesImgs = [
  { src: "/wa-panas.png", alt: "Grupo de panas reaccionando a su reporte" },
  { src: "/wa-familia.png", alt: "Grupo familiar reaccionando a su reporte" },
  { src: "/wa-uni.png", alt: "Grupo de la universidad reaccionando a su reporte" },
];

const telefonos = [
  {
    titulo: "Los Panas del Kilo",
    miembros: "Kike, Nando, Chino, Tavo y 8 más",
    avatar: "🍺",
    mensajes: [
      {
        linkCard: true,
        texto: "señores tienen que leer esto",
        hora: "5:38 p.m.",
        propia: true,
      },
      {
        de: "Kike",
        colorDe: "text-[#53bdeb]",
        avatar: "🧢",
        texto: "¿QUIÉN le dio nuestro chat a este man? 😭",
        hora: "5:39 p.m.",
        reaccion: "😂 4",
      },
      {
        de: "Nando",
        colorDe: "text-[#e77f51]",
        avatar: "😎",
        citando: { de: "Tú", texto: "señores tienen que leer esto" },
        texto: "el apodo que me puso lowkey me la aplicó",
        hora: "5:39 p.m.",
      },
      {
        de: "Chino",
        colorDe: "text-[#25d366]",
        avatar: "🕶️",
        texto: "te lo mereces la verdad 💀",
        hora: "5:39 p.m.",
      },
      {
        de: "Kike",
        colorDe: "text-[#53bdeb]",
        avatar: "🧢",
        texto: "diablo está muy bueno esto",
        hora: "5:40 p.m.",
      },
    ],
  },
  {
    titulo: "Familia Unida 🙏",
    miembros: "Mamá, Tía Mirna, Papo y 9 más",
    avatar: "🙏",
    mensajes: [
      {
        de: "Papo",
        colorDe: "text-[#53bdeb]",
        avatar: "🧔🏽",
        tarjeta:
          "Banderas verdes: aquí hay amor del bueno. Cuando Papo por fin consiguió trabajo, el grupo celebró como si Panamá hubiera clasificado al Mundial.",
        hora: "8:12 p.m.",
      },
      {
        de: "Mamá",
        colorDe: "text-[#a78bfa]",
        avatar: "👩🏽‍🦱",
        texto: "JAJAJAJAJAJA",
        hora: "8:13 p.m.",
      },
      { texto: "Jajajajajajjajajaa", hora: "8:13 p.m.", propia: true },
      { texto: "SEÑORES", hora: "8:13 p.m.", propia: true },
      {
        de: "Tía Mirna",
        colorDe: "text-[#f472b6]",
        avatar: "👵🏽",
        texto: "Q locura",
        hora: "8:14 p.m.",
      },
      {
        de: "Abuela",
        colorDe: "text-[#fbbf24]",
        avatar: "👵🏼",
        texto: "Que es esto",
        hora: "8:14 p.m.",
        reaccion: "😂 4",
      },
      { texto: "Léelo", hora: "8:15 p.m.", propia: true },
      {
        de: "Papo",
        colorDe: "text-[#53bdeb]",
        avatar: "🧔🏽",
        texto: "Que honor",
        hora: "8:16 p.m.",
      },
    ],
  },
  {
    titulo: "La Junta 🍻",
    miembros: "Moncho, Yeyo, Lalo y 5 más",
    avatar: "🎱",
    mensajes: [
      {
        de: "Yeyo",
        colorDe: "text-[#25d366]",
        avatar: "🧉",
        tarjeta:
          "Predicción: Moncho va a decir que él no es así. Moncho es exactamente así.",
        hora: "10:02 p.m.",
      },
      {
        de: "Moncho",
        colorDe: "text-[#e77f51]",
        avatar: "🐻",
        texto: "yo no soy así",
        hora: "10:03 p.m.",
        reaccion: "💀 6",
      },
      {
        de: "Lalo",
        colorDe: "text-[#53bdeb]",
        avatar: "🎧",
        texto: "JAJAJAJA lo clavó",
        hora: "10:03 p.m.",
      },
      {
        de: "Yeyo",
        colorDe: "text-[#25d366]",
        avatar: "🧉",
        texto: "Wild",
        hora: "10:03 p.m.",
      },
      {
        texto: "me gané la copa línea más loca",
        hora: "10:04 p.m.",
        propia: true,
      },
      {
        texto: "¿metemos a Beto al hate club?",
        hora: "10:04 p.m.",
        propia: true,
        reaccion: "😂 3",
      },
      {
        de: "Lalo",
        colorDe: "text-[#53bdeb]",
        avatar: "🎧",
        texto: "Beto ya sabe más de nosotros que nosotros",
        hora: "10:05 p.m.",
      },
    ],
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
              Subes cualquier chat de WhatsApp, Beto se lee cada mensaje y te
              tira un reporte con su opinión real de todos ustedes. Sin filtro.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/nuevo"
                className="rounded-full bg-accent px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-0.5"
              >
                Pedir mi reporte
              </Link>
              <p className="text-sm text-muted">
                Sin cuenta y sin tarjeta · 3 min pa&rsquo;l reporte
              </p>
            </div>
            <p className="mt-6 max-w-xl rounded-lg border border-line bg-card px-4 py-3 text-sm text-muted">
              🔒 <span className="font-medium text-ink">Tu chat no se guarda.</span>{" "}
              Se procesa una sola vez para escribir el reporte y se descarta.
              Tratamos tus datos conforme a la Ley 81 de 2019 de Protección de
              Datos Personales de Panamá.
            </p>
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
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Lo que pasa cuando sueltas el link
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            El chat no se calla en una semana. Esto es real: la gente
            reaccionando a su propio reporte.
          </p>
          <div className="mt-12 grid items-start gap-8 sm:grid-cols-2">
            <div className="flotar-a">
              <Image
                src="/wa-panas.png"
                alt="Un grupo de amigos reaccionando en WhatsApp a su reporte de El Pana Beto"
                width={440}
                height={900}
                className="mx-auto w-full max-w-[300px] rounded-[2rem] border border-line shadow-2xl"
              />
              <VeredictoBeto>
                Cuando el link cae en el grupo de los panas, lo primero es
                «¿quién le dio nuestro chat a este man?». Lo segundo es leerlo
                tres veces.
              </VeredictoBeto>
            </div>
            <div className="flotar-b">
              <Image
                src="/wa-familia.png"
                alt="Un grupo familiar reaccionando en WhatsApp a su reporte de El Pana Beto"
                width={440}
                height={900}
                className="mx-auto w-full max-w-[300px] rounded-[2rem] border border-line shadow-2xl"
              />
              <VeredictoBeto>
                Y en la familia hasta la abuela pregunta «¿qué es esto?» — justo
                antes de que mamá lo reenvíe a otros cuatro grupos.
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

      <section className="border-y border-line bg-card py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Familia, frenes o el grupo de la U
          </h2>
          <p className="mt-3 text-muted">
            Beto los lee todos. Y en todos pasa lo mismo.
          </p>
        </div>
        <div className="marquee mt-10">
          <div className="marquee-track items-start">
            {[...reaccionesImgs, ...reaccionesImgs].map((r, i) => (
              <Image
                key={`${r.src}-${i}`}
                src={r.src}
                alt={r.alt}
                width={300}
                height={640}
                className="w-56 shrink-0 rounded-[1.75rem] border border-line shadow-xl"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-20 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              No solo pa&rsquo; reír
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
              ¿Tú y tu pareja? Beto también los lee.
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Suban su chat y Beto les dice lo que de verdad está pasando: quién
              persigue y quién huye, qué se repite en cada pelea, cuáles son sus
              green flags y sus red flags. Un espejo con humor — de esos que
              incomodan porque aciertan. Para el que quiere entenderse un poco
              más, o para la pareja que se atreve a leerlo junta.
            </p>
            <Link
              href="/nuevo"
              className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-0.5"
            >
              Leer nuestra relación
            </Link>
          </div>
          <div className="flotar-b mx-auto w-full max-w-[300px]">
            <ChatWhatsAppDark
              titulo="Andrés 💛"
              miembros="en línea"
              avatar="💛"
              noLeidos="2"
              mensajes={[
                {
                  de: "Andrés",
                  colorDe: "text-[#e0b0ff]",
                  texto: "todo bien?",
                  hora: "11:02 p.m.",
                },
                { texto: "sí", hora: "11:20 p.m.", propia: true },
                {
                  de: "Andrés",
                  colorDe: "text-[#e0b0ff]",
                  texto: "segura? te sentí rara hoy",
                  hora: "11:21 p.m.",
                },
                { texto: "que sí Andrés, todo bien 🙂", hora: "11:40 p.m.", propia: true },
                {
                  de: "Andrés",
                  colorDe: "text-[#e0b0ff]",
                  texto: "ok…",
                  hora: "11:41 p.m.",
                },
              ]}
            />
            <VeredictoBeto>
              Ese «sí» tardó 18 minutos y vino con punto final. Andrés, mijo,
              eso no es un sí — eso es una citación. Aquí alguien persigue y
              alguien contesta con emoji. Beto sabe cuál es cuál.
            </VeredictoBeto>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          Qué trae el reporte
        </h2>
        <p className="mt-3 text-muted">
          No es un summary aburrido. Es la opinión de un pana que se leyó todo
          y tiene demasiado que decir.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {contenido.map((c) => (
            <article
              key={c.titulo}
              className="rounded-lg border border-line bg-card p-5"
            >
              <p className="text-2xl">{c.emoji}</p>
              <h3 className="font-display mt-2 text-lg font-semibold">
                {c.titulo}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{c.desc}</p>
            </article>
          ))}
        </div>
      </section>


      <section className="border-t border-line bg-card">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-20 sm:grid-cols-[2fr_3fr] sm:items-center">
          <div className="flex justify-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-full border border-line bg-paper text-6xl shadow-sm">
              🎵
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Nuevo
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
              Beto también le hace una canción a tu grupo.
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Elige el género —plena, reggaetón, salsa, típico o balada de
              despecho— y Beto compone un himno original con los apodos, los
              premios y las vergüenzas del grupo. Se vuelve el nuevo audio que
              todos reenvían en el chat.
            </p>
            <Link
              href="/nuevo"
              className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-0.5"
            >
              Que Beto nos componga
            </Link>
          </div>
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
            {["👨‍👩‍👧 La familia", "🍻 Los frenes", "💼 El trabajo", "🎓 La U", "💔 La ex", "🤝 El casi algo"].map(
              (c) => (
                <span
                  key={c}
                  className="rounded-full border border-line bg-paper px-4 py-1.5 text-sm"
                >
                  {c}
                </span>
              ),
            )}
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
