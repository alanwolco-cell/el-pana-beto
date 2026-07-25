import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Los términos de uso de El Pana Beto.",
};

function Bloque({
  n,
  titulo,
  children,
}: {
  n: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold">
        {n}. {titulo}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function Terminos() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Lo legal, en cristiano
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Términos y Condiciones
      </h1>
      <p className="mt-4 leading-relaxed text-muted">
        Al usar El Pana Beto aceptas esto. Lo escribimos claro para que de
        verdad lo leas.
      </p>

      <Bloque n="1" titulo="Qué es esto">
        <p>
          El Pana Beto es un servicio de entretenimiento: subes el texto de un
          chat y una inteligencia artificial escribe un reporte humorístico y
          satírico sobre el grupo. Todo lo que dice Beto es humor y ficción
          construida a partir de tu chat, no hechos verificados ni opiniones
          reales de nadie.
        </p>
      </Bloque>

      <Bloque n="2" titulo="Tú respondes por el chat que subes">
        <p>
          Al subir una conversación declaras que tienes derecho a hacerlo y que
          asumes la responsabilidad de compartirla. No subas chats obtenidos de
          forma ilegal ni conversaciones de personas que razonablemente se
          opondrían. El reporte es para reírse entre el grupo, no para acosar,
          humillar ni exponer a nadie fuera de él.
        </p>
      </Bloque>

      <Bloque n="3" titulo="El humor tiene su límite">
        <p>
          Beto se burla con cariño, pero es una IA y a veces se equivoca o
          exagera. El reporte no representa la verdad ni la opinión de El Pana
          Beto ni de las personas mencionadas. Úsalo con criterio y buena onda.
        </p>
      </Bloque>

      <Bloque n="4" titulo="Pagos">
        <p>
          Algunos reportes y funciones (como la canción) se desbloquean con un
          pago procesado por PagueloFacil. Los precios se muestran antes de
          pagar. Por la naturaleza digital e inmediata del producto, los pagos
          no son reembolsables una vez generado el contenido, salvo por una
          falla técnica atribuible a nosotros.
        </p>
      </Bloque>

      <Bloque n="5" titulo="Tus datos">
        <p>
          El texto del chat se procesa una sola vez para escribir el reporte y
          se descarta; el reporte generado sí se guarda para que el enlace
          funcione. Todo el detalle está en nuestra{" "}
          <Link
            href="/privacidad"
            className="underline transition-colors hover:text-accent"
          >
            Política de Privacidad
          </Link>
          , que forma parte de estos términos.
        </p>
      </Bloque>

      <Bloque n="6" titulo="Sin garantías">
        <p>
          El servicio se ofrece &laquo;tal cual&raquo;. No garantizamos que esté
          siempre disponible ni que el reporte cumpla una expectativa
          específica. En la medida que la ley lo permita, no somos responsables
          por daños derivados del uso del servicio o del contenido que generes o
          compartas.
        </p>
      </Bloque>

      <Bloque n="7" titulo="Edad">
        <p>
          Si eres menor de edad, usa El Pana Beto solo con permiso de tu padre,
          madre o tutor.
        </p>
      </Bloque>

      <Bloque n="8" titulo="Cambios y ley aplicable">
        <p>
          Podemos actualizar estos términos; la versión vigente vive en esta
          página. Se rigen por las leyes de la República de Panamá. Dudas o
          reclamos:{" "}
          <a
            href="mailto:elpanabeto.com@gmail.com"
            className="underline transition-colors hover:text-accent"
          >
            elpanabeto.com@gmail.com
          </a>
          .
        </p>
      </Bloque>
    </div>
  );
}
