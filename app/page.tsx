import Image from "next/image";
import Link from "next/link";
import { ChatWhatsAppDark, VeredictoBeto } from "./chat-demo";
import ContadorReportes from "./contador-reportes";

export const revalidate = 300; // ISR: refresca el contador cada 5 min

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
      "Sube el archivo o pega la conversación. Beto se lee todo el bochinche, hasta las épocas viejas que ustedes ya ni recuerdan.",
  },
  {
    numero: "03",
    titulo: "Recibe el veredicto",
    texto:
      "A los 3 minutos Beto te suelta el reporte: apodos, premios, banderas rojas y las frases que nadie quería que quedaran guardadas.",
  },
];

const contenido = [
  { emoji: "🔥", titulo: "Los temas del grupo", desc: "Esas obsesiones que ustedes juran que son normales." },
  { emoji: "👤", titulo: "Un perfil por cabeza", desc: "Con el apodo que cada quien se ganó a pulso." },
  { emoji: "🏆", titulo: "Los premios", desc: "Del que no suelta el chat al que solo revive en los cumpleaños." },
  { emoji: "✨", titulo: "El ranking de aura", desc: "Quién la tiene infinita y quién quedó debiendo." },
  { emoji: "🗣️", titulo: "El diccionario", desc: "Esos inside jokes que nadie de afuera entiende." },
  { emoji: "🚩", titulo: "Las banderas", desc: "Green flags y red flags, con los recibos en mano." },
  { emoji: "🤯", titulo: "Frases célebres", desc: "Tal cual las escribieron, con contexto." },
  { emoji: "🔮", titulo: "Predicciones", desc: "Cómo va a reaccionar cada uno cuando lea esto." },
];

const paises = [
  "🇵🇦 Panamá",
  "🇲🇽 México",
  "🇨🇴 Colombia",
  "🇦🇷 Argentina",
  "🇻🇪 Venezuela",
  "🇨🇱 Chile",
  "🇪🇸 España",
  "🇩🇴 Rep. Dominicana",
  "🇵🇪 Perú",
  "🇪🇨 Ecuador",
];

const preguntas = [
  {
    p: "¿Quién es Beto?",
    r: "Una IA que opina como un tío panameño. No existe de verdad, pero se lee tu chat completo y comenta como si estuviera en el grupo desde el 2015.",
  },
  {
    p: "¿Qué chats sirven?",
    r: "Todos: la familia, los frenes, el trabajo, la U, la ex, el casi algo. Mientras más bochinche, mejor sale el reporte.",
  },
  {
    p: "¿Qué apps soporta?",
    r: "WhatsApp, que es donde está el bochinche de verdad. Exportas el chat con la opción «Sin archivos» y te genera un .txt listo para subir.",
  },
  {
    p: "¿Beto solo funciona pa' Panamá?",
    r: "No, qué va. Le dices de dónde es el grupo y Beto adapta la jerga, las referencias y los chistes a tu país: México, Colombia, Argentina, España, donde sea. Si no le dices nada, tira panameño clásico.",
  },
  {
    p: "¿Cuánto tarda?",
    r: "Buco rápido: unos minutos exportando de tu lado, y unos 3 mientras Beto lee todo y escribe.",
  },
  {
    p: "¿Es seguro compartir mi chat?",
    r: "El chat se procesa una sola vez para escribir el reporte y se descarta. El reporte queda en un link con código imposible de adivinar: solo lo abre quien tenga ese link, o sea, tu grupo. Tratamos tus datos conforme a la Ley 81 de 2019 de Panamá.",
  },
  {
    p: "¿Cómo comparto el reporte?",
    r: "Cada reporte tiene su link único. Lo mandas al grupo y que empiece el bochinche.",
  },
  {
    p: "¿Y si necesito ayuda?",
    r: "Escríbenos a elpanabeto.com@gmail.com. Sí, el correo lleva el .com adentro: compramos el dominio y nos emocionamos. Beto no contesta correos (está leyendo chats), pero su equipo sí.",
  },
];

const reaccionesImgs = [
  { src: "/wa-panas.png", alt: "Grupo de panas reaccionando a su reporte" },
  { src: "/wa-familia.png", alt: "Grupo familiar reaccionando a su reporte" },
  { src: "/wa-uni.png", alt: "Grupo de la universidad reaccionando a su reporte" },
];

export default function Home() {
  return (
    <>
      {/* Hero: valor en 3 segundos + CTA + prueba social + cero fricción */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-20">
        <div className="grid items-center gap-10 sm:grid-cols-[3fr_2fr]">
          <div>
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-accent sm:mb-6">
              ¿Qué xopá? · Reportes de chats de WhatsApp
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05] lg:text-6xl">
              Pásale el chat a Beto. Él se lee todo el bochinche y te dice
              las cosas como son.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted sm:mt-6">
              Subes cualquier chat de WhatsApp y Beto se lee cada mensaje. Te
              tira un reporte con apodos, premios, banderas rojas y su opinión
              real de todos ustedes. Sin filtro.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-4 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/nuevo"
                className="rounded-full bg-accent px-6 py-3.5 text-center font-medium text-paper transition-transform hover:-translate-y-0.5 sm:py-3"
              >
                Pedir mi reporte
              </Link>
              <div>
                <ContadorReportes />
                <p className="text-sm text-muted">
                  Sin cuenta y sin tarjeta · 3 min pa&rsquo;l reporte
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-xl rounded-lg border border-line bg-card px-4 py-3 text-sm text-muted">
              🔒 <span className="font-medium text-ink">Tu chat no se guarda.</span>{" "}
              Se procesa una sola vez para escribir el reporte y se descarta.
              Tratamos tus datos conforme a la Ley 81 de 2019 de Protección de
              Datos Personales de Panamá.
            </p>
          </div>
          <div>
            <Image
              src="/beto.jpg"
              alt="Beto: un señor panameño sonriente con sombrero pintado y guayabera"
              width={450}
              height={450}
              priority
              className="mx-auto w-full max-w-xs rounded-2xl border border-line shadow-sm sm:max-w-none"
            />
            <VeredictoBeto>
              Me leí 3 años de este grupo en 3 minutos. Ya sé quién deja en
              visto, quién revive el chat a la 1 a.m. y quién sigue debiendo
              la plata del viaje.
            </VeredictoBeto>
          </div>
        </div>
      </section>

      {/* Prueba social: reacciones reales, arriba y visibles */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Lo que pasa cuando sueltas el link
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            El chat no se calla en una semana. Esto es real: la gente
            reaccionando a su propio reporte.
          </p>
          <div className="mt-10 grid items-start gap-12 sm:mt-12 sm:grid-cols-2 sm:gap-8">
            <div className="flotar-a">
              <Image
                src="/wa-panas.png"
                alt="Un grupo de amigos reaccionando en WhatsApp a su reporte de El Pana Beto"
                width={440}
                height={900}
                className="mx-auto w-full max-w-[300px] rounded-[2rem] border border-line shadow-2xl"
              />
              <VeredictoBeto>
                Cuando el link cae en el grupo, lo primero que preguntan es
                «¿quién le dio nuestro chat a este man?». Después lo leen
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
                En la familia hasta la abuela pregunta «¿qué es esto?». Y mamá
                ya lo reenvió a otros cuatro grupos.
              </VeredictoBeto>
            </div>
          </div>
        </div>
      </section>

      {/* Valor y curiosidad: qué trae el reporte, con CTA en el punto de decisión */}
      <section className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          Qué trae el reporte
        </h2>
        <p className="mt-3 text-muted">
          La opinión completa de un pana que se leyó todo tu chat y tiene
          demasiado que decir.
        </p>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
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
        <div className="mt-8 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-5">
          <Link
            href="/nuevo"
            className="inline-block w-full rounded-full bg-accent px-6 py-3.5 text-center font-medium text-paper transition-transform hover:-translate-y-0.5 sm:w-auto sm:py-3"
          >
            Quiero ver el mío
          </Link>
          <p className="text-sm text-muted">
            Ya estás pensando en tu grupo. Beto lo sabe.
          </p>
        </div>
      </section>

      {/* Fricción cero: tres pasos */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Tres pasos. Ni cuenta necesitas.
          </h2>
          <div className="mt-8 grid gap-8 sm:mt-10 sm:grid-cols-3 sm:gap-10">
            {pasos.map((p) => (
              <div key={p.numero}>
                <p className="text-sm font-semibold text-accent">{p.numero}</p>
                <h3 className="font-display mt-2 text-2xl font-semibold">
                  {p.titulo}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciador 1: la canción */}
      <section className="border-y border-line bg-ink text-paper">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 sm:grid-cols-[2fr_3fr] sm:items-center sm:gap-10 sm:py-24">
          <div className="flex justify-center">
            <div className="flotar-a flex h-36 w-36 items-center justify-center rounded-full bg-accent text-6xl shadow-2xl sm:h-44 sm:w-44 sm:text-7xl">
              🎤
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Esto no lo tiene nadie más
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
              Beto le compone una canción a tu grupo. De verdad.
            </h2>
            <p className="mt-4 leading-relaxed text-paper/70">
              No es un chiste: es una canción completa, cantada, con los apodos
              y las vergüenzas de cada quien metidos en la letra. Eliges el
              género y Beto la escribe.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["🪘 Plena", "🔥 Reggaetón", "💃 Salsa", "🎻 Típico", "💔 Balada de despecho"].map(
                (g) => (
                  <span
                    key={g}
                    className="rounded-full border border-paper/25 px-3.5 py-1.5 text-sm text-paper/90"
                  >
                    {g}
                  </span>
                ),
              )}
            </div>
            <p className="mt-5 text-sm text-paper/60">
              El audio que el grupo va a poner en el próximo party, gritar en el
              carro y reenviar hasta el cansancio.
            </p>
            <Link
              href="/nuevo"
              className="mt-6 inline-block w-full rounded-full bg-accent px-6 py-3.5 text-center font-medium text-paper transition-transform hover:-translate-y-0.5 sm:w-auto sm:py-3"
            >
              🎧 Que Beto nos componga
            </Link>
          </div>
        </div>
      </section>

      {/* Diferenciador 2: Beto se adapta a tu país */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-14 sm:grid-cols-2 sm:py-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Donde sea que estén
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
              Dile de dónde son y Beto les habla en su idioma.
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Beto es panameño hasta la muerte, pero viaja. Le dices el país
              del grupo y adapta la jerga, las referencias y los chistes:
              el reporte les suena a alguien que creció con ustedes. Y si no
              le dices nada, tira panameño clásico.
            </p>
            <Link
              href="/nuevo"
              className="mt-6 inline-block w-full rounded-full bg-accent px-6 py-3.5 text-center font-medium text-paper transition-transform hover:-translate-y-0.5 sm:w-auto sm:py-3"
            >
              Probar con mi grupo
            </Link>
          </div>
          <div className="flex flex-wrap content-center justify-center gap-2">
            {paises.map((p) => (
              <span
                key={p}
                className="rounded-full border border-line bg-paper px-4 py-2 text-sm"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Caso de uso secundario: la pareja */}
      <section>
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-14 sm:grid-cols-2 sm:py-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              No solo pa&rsquo; reír
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
              ¿Tú y tu pareja? Beto también los lee.
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Suban su chat y Beto les cuenta qué es lo que realmente está
              pasando: quién persigue, quién se hace el loco y cuál pelea se
              repite cada dos semanas. Da risa hasta que te toca a ti. Si se
              atreven, léanlo juntos.
            </p>
            <Link
              href="/nuevo"
              className="mt-6 inline-block w-full rounded-full bg-accent px-6 py-3.5 text-center font-medium text-paper transition-transform hover:-translate-y-0.5 sm:w-auto sm:py-3"
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
              Ese «sí» tardó 18 minutos y vino con punto final. Eso es una
              citación, Andrés. Aquí uno persigue y el otro contesta con
              emoji, y Beto ya sabe quién es quién.
            </VeredictoBeto>
          </div>
        </div>
      </section>

      {/* Más prueba social: todos los grupos caen */}
      <section className="border-y border-line bg-card py-14 sm:py-16">
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
                className="w-48 shrink-0 rounded-[1.75rem] border border-line shadow-xl sm:w-56"
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
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

      {/* Cierre: el último empujón */}
      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-5xl px-6 py-14 text-center sm:py-20">
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
                  className="rounded-full border border-line bg-paper px-4 py-2 text-sm"
                >
                  {c}
                </span>
              ),
            )}
          </div>
          <Link
            href="/nuevo"
            className="mt-8 inline-block w-full rounded-full bg-accent px-8 py-4 text-center font-medium text-paper transition-transform hover:-translate-y-0.5 sm:mt-10 sm:w-auto"
          >
            Pedir mi reporte
          </Link>
          <div className="mt-4 flex flex-col items-center gap-1">
            <ContadorReportes />
            <p className="text-sm text-muted">
              Sin cuenta y sin tarjeta · 3 min pa&rsquo;l reporte
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
