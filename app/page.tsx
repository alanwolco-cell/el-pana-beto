import Image from "next/image";
import Link from "next/link";
import {
  ChatIMessage,
  ChatWhatsAppDark,
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
  { emoji: "🔥", titulo: "Los temas del grupo", desc: "Las obsesiones que ustedes creen normales." },
  { emoji: "👤", titulo: "Un perfil por cabeza", desc: "Con el apodo que cada uno se ganó a pulso." },
  { emoji: "🏆", titulo: "Los premios", desc: "Al que más habla, al que solo aparece en los cumpleaños." },
  { emoji: "🗣️", titulo: "El diccionario", desc: "Su jerga interna, traducida al español." },
  { emoji: "🚩", titulo: "Las banderas", desc: "Verdes y rojas, con evidencia citada." },
  { emoji: "🤯", titulo: "Frases célebres", desc: "Textuales, con contexto y sin piedad." },
  { emoji: "🔮", titulo: "Predicciones", desc: "Cómo va a reaccionar cada uno al leer esto." },
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
    r: "Buco rápido: unos 5 minutos exportando de tu lado, y otros 5 mientras Beto lee todo y escribe.",
  },
  {
    p: "¿Es seguro compartir mi chat?",
    r: "El chat se procesa una sola vez para escribir el reporte, se descarta y nunca se usa para entrenar ningún modelo. El reporte vive en un link privado con código imposible de adivinar, que solo tiene tu grupo. Tratamos tus datos conforme a la Ley 81 de 2019 de Panamá.",
  },
  {
    p: "¿Cómo comparto el reporte?",
    r: "Cada reporte tiene su link único. Lo mandas al grupo y que empiece el bochinche.",
  },
];

const telefonos = [
  {
    titulo: "Los Panas del Kilo",
    miembros: "Kike, Nando, Chino, Tavo y 8 más",
    mensajes: [
      { linkCard: true, texto: "Reporte completo señores", hora: "5:38 p.m.", propia: true },
      { texto: "Vale la pena leerlo", hora: "5:38 p.m.", propia: true },
      {
        de: "Kike",
        colorDe: "text-[#53bdeb]",
        texto: "¿QUIÉN LE DIO NUESTRO CHAT A ESE SEÑOR?",
        hora: "5:39 p.m.",
        reaccion: "😂 3",
      },
      {
        de: "Nando",
        colorDe: "text-[#e77f51]",
        citando: { de: "Tú", texto: "Reporte completo señores" },
        texto: "el apodo que me puso no me lo merezco",
        hora: "5:40 p.m.",
      },
      {
        de: "Chino",
        colorDe: "text-[#25d366]",
        texto: "sí te lo mereces",
        hora: "5:40 p.m.",
        reaccion: "❤️ 5",
      },
      { texto: "JAJAJAJAJAJA", hora: "5:41 p.m.", propia: true },
    ],
  },
  {
    titulo: "Familia Unida 🙏",
    miembros: "Mamá, Tía Mirna, Papo y 9 más",
    mensajes: [
      {
        de: "Papo",
        colorDe: "text-[#53bdeb]",
        tarjeta:
          "Banderas verdes: aquí hay amor del bueno. Cuando Papo por fin consiguió trabajo, el grupo celebró como si Panamá hubiera clasificado al Mundial.",
        hora: "8:12 p.m.",
      },
      {
        de: "Mamá",
        colorDe: "text-[#a78bfa]",
        texto: "JAJAJAJAJAJA",
        hora: "8:13 p.m.",
      },
      {
        de: "Tía Mirna",
        colorDe: "text-[#f472b6]",
        texto: "¿Quién es este señor Beto y por qué sabe todo? 🙏",
        hora: "8:14 p.m.",
        reaccion: "😂 4",
      },
      { texto: "mamá lo leyó dos veces", hora: "8:15 p.m.", propia: true },
      {
        de: "Mamá",
        colorDe: "text-[#a78bfa]",
        texto: "Tres veces. Y lo reenvié.",
        hora: "8:15 p.m.",
      },
    ],
  },
  {
    titulo: "La Junta 🍻",
    miembros: "Moncho, Yeyo, Lalo y 5 más",
    mensajes: [
      {
        de: "Yeyo",
        colorDe: "text-[#25d366]",
        tarjeta:
          "Predicción: Moncho va a decir que él no es así. Moncho es exactamente así.",
        hora: "10:02 p.m.",
      },
      {
        de: "Moncho",
        colorDe: "text-[#e77f51]",
        texto: "yo no soy así",
        hora: "10:03 p.m.",
        reaccion: "💀 6",
      },
      {
        de: "Lalo",
        colorDe: "text-[#53bdeb]",
        texto: "JAJAJAJA lo clavó",
        hora: "10:03 p.m.",
      },
      { texto: "¿metemos a Beto al grupo?", hora: "10:04 p.m.", propia: true },
      {
        de: "Yeyo",
        colorDe: "text-[#25d366]",
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
                Sin cuenta y sin tarjeta · 5 min pa&rsquo;l reporte
              </p>
            </div>
            <p className="mt-6 max-w-xl rounded-lg border border-line bg-card px-4 py-3 text-sm text-muted">
              🔒 <span className="font-medium text-ink">Tu chat no se guarda.</span>{" "}
              Se procesa una sola vez para escribir el reporte, se descarta y
              nunca se usa para entrenar ningún modelo. Tratamos tus datos
              conforme a la Ley 81 de 2019 de Protección de Datos Personales de
              Panamá.
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
            Así se ve cuando Beto opina
          </h2>
          <div className="mt-12 grid gap-x-10 gap-y-14 sm:grid-cols-2">
            <div className="flotar-a">
              <ChatWhatsAppDark
                titulo="Familia Quintero 🇵🇦"
                miembros="Mamá, Tía Mirna, Papo y tú"
                mensajes={[
                  {
                    de: "Tía Mirna",
                    colorDe: "text-[#f472b6]",
                    texto:
                      "Buenos días familia 🌹🙏 El que no reenvíe esta oración no quiere a su madre",
                    hora: "6:02 a.m.",
                  },
                  {
                    de: "Mamá",
                    colorDe: "text-[#a78bfa]",
                    texto:
                      "¿QUIÉN se comió el arroz con pollo que era PARA EL DOMINGO?",
                    hora: "9:14 a.m.",
                  },
                  {
                    de: "Papo",
                    colorDe: "text-[#53bdeb]",
                    texto: "yo no fui, yo estaba en el gym",
                    hora: "9:20 a.m.",
                  },
                  {
                    de: "Mamá",
                    colorDe: "text-[#a78bfa]",
                    texto: "Papo tú no tienes gym",
                    hora: "9:21 a.m.",
                  },
                  {
                    texto: "yo vi a Papo con un plato a las 2 a.m. 👀",
                    hora: "9:30 a.m.",
                    propia: true,
                  },
                  {
                    de: "Papo",
                    colorDe: "text-[#53bdeb]",
                    texto: "sapo",
                    hora: "9:31 a.m.",
                    reaccion: "😂 8",
                  },
                ]}
              />
              <VeredictoBeto>
                El «gym» de Papo abre solo de madrugada y queda en la cocina. Y
                la cadena de la tía Mirna tiene más alcance que TVN. Aquí todo
                el mundo sabe todo — están esperando a ver quién lo dice
                primero.
              </VeredictoBeto>
            </div>
            <div className="flotar-b">
              <ChatIMessage
                titulo="Los Frenes 🍻"
                mensajes={[
                  { fecha: "Miércoles 8:03 p. m." },
                  { de: "Kike", texto: "fren SERIO este sábado playa sí o sí" },
                  { de: "Nando", texto: "confirmo 🔥" },
                  { de: "Chino", texto: "confirmadísimo" },
                  { texto: "ok, yo alquilo el carro", propia: true },
                  { fecha: "Sábado 7:14 a. m." },
                  { de: "Kike", texto: "fren amanecí malito 🤧" },
                  {
                    de: "Nando",
                    texto: "me salió un cumple que se me había olvidado",
                  },
                  { texto: "ya pagué el carro.", propia: true },
                ]}
              />
              <VeredictoBeto>
                Tres confirmaciones, cero asistencia: este grupo confirma con
                el corazón y cancela con el alma. Y tú sigues alquilando carros
                como si no los conocieras desde el colegio.
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
            Los grupos reaccionando a su reporte
          </h2>
          <p className="mt-3 text-muted">
            Lo que pasa en el chat cuando alguien suelta el link.
          </p>
        </div>
        <div className="marquee mt-10">
          <div className="marquee-track items-start">
            {[...telefonos, ...telefonos].map((t, i) => (
              <div key={`${t.titulo}-${i}`} className="w-80 shrink-0">
                <ChatWhatsAppDark
                  titulo={t.titulo}
                  miembros={t.miembros}
                  mensajes={t.mensajes}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          Qué trae el reporte
        </h2>
        <p className="mt-3 text-muted">
          No es un resumen. Es la opinión de un pana que se leyó todo y tiene
          mucho que decir.
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
