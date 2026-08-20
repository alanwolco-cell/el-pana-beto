import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad · El Pana Beto",
  description:
    "Cómo El Pana Beto trata tus datos: qué se guarda, qué no, con quién se comparte y cómo ejercer tus derechos bajo la Ley 81 de 2019 de Panamá.",
};

const encargados = [
  {
    nombre: "Vercel Inc. (EE. UU.)",
    rol: "Aloja el sitio web y almacena los reportes, fotos y canciones en su servicio Vercel Blob.",
  },
  {
    nombre: "Anthropic (EE. UU.)",
    rol: "Provee la inteligencia artificial (Claude) que lee el chat y escribe el reporte, a través de Vercel AI Gateway. Anthropic no usa tus datos para entrenar sus modelos.",
  },
  {
    nombre: "ElevenLabs (EE. UU.)",
    rol: "Genera el audio de la canción a partir de una letra original escrita por la IA. Recibe la letra, nunca el chat.",
  },
  {
    nombre: "PagueloFacil (Panamá)",
    rol: "Procesa los pagos con tarjeta. Los datos de tu tarjeta los maneja PagueloFacil directamente; nosotros nunca los vemos ni los guardamos.",
  },
  {
    nombre: "Meta Platforms (WhatsApp Business, EE. UU.)",
    rol: "Solo si pides recibir el link por WhatsApp: se usa tu número una vez para enviarte el mensaje.",
  },
];

export default function Privacidad() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Legal · Ley 81 de 2019
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Política de Privacidad
      </h1>
      <p className="mt-4 text-sm text-muted">Última actualización: 25 de julio de 2026</p>
      <p className="mt-6 leading-relaxed text-muted">
        Esta política explica, en lenguaje claro, cómo tratamos tus datos
        personales cuando usas El Pana Beto (elpanabeto.com), conforme a la Ley
        81 de 26 de marzo de 2019 sobre Protección de Datos Personales de la
        República de Panamá y su reglamentación.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">
          1. Quién es responsable de tus datos
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          El responsable del tratamiento es{" "}
          <span className="font-medium text-ink">El Pana Beto</span>. Para
          cualquier tema de privacidad, escríbenos a{" "}
          <a
            href="mailto:elpanabeto.com@gmail.com"
            className="underline transition-colors hover:text-accent"
          >
            elpanabeto.com@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">
          2. Lo más importante: tu chat no se guarda
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          El archivo de chat que subes o pegas{" "}
          <span className="font-medium text-ink">
            se procesa una sola vez y se descarta
          </span>
          . No lo almacenamos en ningún servidor ni base de datos, y no se usa
          para entrenar ningún modelo de inteligencia artificial.
        </p>
        <p className="mt-3 leading-relaxed text-muted">
          Ahora, seamos honestos contigo: el{" "}
          <span className="font-medium text-ink">reporte</span> que la IA
          escribe a partir del chat sí se guarda, y ese reporte incluye
          información que salió del chat: nombres, apodos, citas textuales de
          mensajes y descripciones de los integrantes del grupo. Es la única
          forma de que puedas verlo y compartirlo con tu grupo.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">
          3. Qué datos guardamos y para qué
        </h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-line bg-card p-5">
            <h3 className="font-medium">El reporte generado</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              El texto que escribe la IA: veredicto, perfiles con nombres y
              apodos, premios, frases textuales del chat y demás secciones.
              También el nombre del grupo, la fecha de creación y la cantidad de
              mensajes. Finalidad: que tú y tu grupo puedan ver y compartir el
              reporte.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-card p-5">
            <h3 className="font-medium">La foto del grupo (opcional)</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Solo si decides subirla, se guarda como portada del reporte.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-card p-5">
            <h3 className="font-medium">Datos de pago</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Cuando alguien aporta para desbloquear un reporte guardamos el
              nombre que indicó, el monto, la fecha y el número de operación que
              nos devuelve PagueloFacil. Nunca guardamos ni vemos números de
              tarjeta. Finalidad: registrar los aportes del grupo y desbloquear
              el reporte.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-card p-5">
            <h3 className="font-medium">La canción (si la piden)</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Se guarda la letra original generada por la IA (que menciona
              nombres y apodos del grupo) y el archivo de audio.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-card p-5">
            <h3 className="font-medium">Tu número de WhatsApp (opcional)</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Si pides recibir el link por WhatsApp, usamos tu número una sola
              vez para enviarte el mensaje y{" "}
              <span className="font-medium text-ink">no lo guardamos</span>.
            </p>
          </div>
        </div>
        <p className="mt-4 leading-relaxed text-muted">
          No usamos tus datos para publicidad, no los vendemos y no creamos
          perfiles comerciales con ellos.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">4. Base legal</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Tratamos tus datos con base en tu{" "}
          <span className="font-medium text-ink">consentimiento</span> (al subir
          el chat y pedir el reporte) y en la{" "}
          <span className="font-medium text-ink">ejecución del servicio</span>{" "}
          que nos pides, conforme a los artículos 6 y 7 de la Ley 81 de 2019.
          Puedes retirar tu consentimiento en cualquier momento pidiendo la
          eliminación de tu reporte (ver sección 8).
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">
          5. Quién puede ver tu reporte, hablemos claro
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Cada reporte vive en un link con un código aleatorio prácticamente
          imposible de adivinar (un identificador de 36 caracteres). No aparece
          en buscadores ni en ninguna lista pública del sitio, y solo lo tiene
          quien pidió el reporte y las personas con las que él lo comparta.
        </p>
        <p className="mt-3 leading-relaxed text-muted">
          Pero no te vamos a prometer que es &laquo;privado&raquo; en el sentido
          estricto:{" "}
          <span className="font-medium text-ink">
            cualquier persona que tenga el link puede abrirlo
          </span>
          , sin contraseña. Lo mismo aplica a la foto y a la canción. Una vez
          que tú o alguien del grupo comparte el link, ustedes deciden hasta
          dónde llega. Si quieres que un reporte deje de existir, pídenos
          borrarlo (sección 8).
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">
          6. Con quién compartimos datos
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          No vendemos ni cedemos tus datos a terceros para sus propios fines.
          Para operar el servicio usamos estos proveedores (encargados del
          tratamiento), que solo procesan los datos siguiendo nuestras
          instrucciones:
        </p>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {encargados.map((e) => (
            <div key={e.nombre} className="py-4">
              <h3 className="font-medium">{e.nombre}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{e.rol}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">
          7. Transferencia internacional de datos
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Varios de nuestros proveedores operan fuera de Panamá (principalmente
          en Estados Unidos), por lo que tus datos se transfieren
          internacionalmente. Estas transferencias se amparan en contratos con
          proveedores que ofrecen niveles de protección de datos adecuados,
          conforme al artículo 5 de la Ley 81 de 2019 y al Decreto Ejecutivo 285
          de 2021.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">
          8. Tus derechos y cómo ejercerlos
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Bajo la Ley 81 de 2019 tienes derecho de{" "}
          <span className="font-medium text-ink">acceso</span> (saber qué datos
          tuyos tenemos), <span className="font-medium text-ink">rectificación</span>{" "}
          (corregirlos), <span className="font-medium text-ink">cancelación</span>{" "}
          (que los eliminemos),{" "}
          <span className="font-medium text-ink">oposición</span> (negarte a un
          tratamiento) y <span className="font-medium text-ink">portabilidad</span>.
        </p>
        <div className="mt-4 rounded-lg border border-line bg-card p-5">
          <p className="leading-relaxed">
            Para ejercerlos, incluido borrar un reporte completo, la foto o la
            canción, escríbenos a{" "}
            <a
              href="mailto:elpanabeto.com@gmail.com"
              className="underline transition-colors hover:text-accent"
            >
              elpanabeto.com@gmail.com
            </a>{" "}
            con el link del reporte.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            No hace falta ser quien lo pidió: si apareces en un reporte y
            quieres que se elimine, tienes el mismo derecho. Atendemos las
            solicitudes dentro de los plazos que establece la Ley 81, sin costo.
          </p>
        </div>
        <p className="mt-4 leading-relaxed text-muted">
          Si consideras que no atendimos bien tu solicitud, puedes presentar un
          reclamo ante la Autoridad Nacional de Transparencia y Acceso a la
          Información (ANTAI), autoridad de protección de datos personales de
          Panamá.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">
          9. Los demás miembros del chat
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Un chat de grupo contiene mensajes de otras personas. Al subir un
          chat, declaras que cuentas con el conocimiento y consentimiento de los
          demás participantes, o que asumes la responsabilidad de informarles.
          Nuestra recomendación de pana: comparte el reporte con el grupo, para
          eso existe. Y recuerda que cualquier miembro del grupo puede pedirnos
          eliminar el reporte en cualquier momento.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">10. Menores de edad</h2>
        <p className="mt-3 leading-relaxed text-muted">
          El servicio está dirigido a personas mayores de 18 años. Si eres menor
          de edad, necesitas la autorización de tu padre, madre o tutor para
          usarlo. Si detectamos o nos reportan datos de menores tratados sin esa
          autorización, los eliminaremos.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">11. Seguridad</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Todo el tráfico del sitio viaja cifrado (HTTPS). Los reportes se
          almacenan bajo identificadores aleatorios no adivinables y el acceso a
          la infraestructura está restringido. Ningún sistema es infalible, pero
          aplicamos medidas técnicas y organizativas razonables para proteger
          tus datos, como exige la Ley 81.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">
          12. Conservación de los datos
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Los reportes, fotos, canciones y registros de pago se conservan
          mientras el servicio exista o hasta que tú (o cualquier miembro del
          grupo) nos pidas eliminarlos. El chat original no se conserva nunca, y
          tu número de WhatsApp no se almacena.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">
          13. Cambios a esta política
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Si cambiamos esta política, publicaremos la versión actualizada en
          esta página con su nueva fecha. Si el cambio es importante, lo
          destacaremos en el sitio.
        </p>
      </section>

      <div className="mt-16 border-t border-line pt-8">
        <Link
          href="/"
          className="text-sm text-muted underline transition-colors hover:text-accent"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
