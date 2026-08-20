import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cancionConfigurada, leerCancion } from "@/lib/cancion";
import {
  cancionComprada,
  comisionConfig,
  descuentoReferido,
  estaDesbloqueado,
  leerPagos,
  obtenerCodigoPana,
  pagosConfigurados,
  precioCancion,
  precioDesbloqueo,
  precioPlan,
  totalPagado,
  USOS_PARA_CORTESIA,
} from "@/lib/pagos";
import type { EstadoPagos } from "@/lib/pagos";
import type { ReporteGuardado } from "@/lib/schema";
import { leerReporte } from "@/lib/storage";
import { CancionDelGrupo } from "./cancion";
import { BotonCompartir } from "./compartir";
import { BotonCompartirImagen } from "./compartir-imagen";
import { BotonWhatsApp } from "./compartir-wa";
import { ReporteMd } from "./reporte-md";
import { ProsaV2, ReporteV2Completo } from "./reporte-v2";
import { ScrollArriba } from "./scroll-arriba";
import { aperturaDeMd, ganchoDeMd, seccionesDeMd, tituloDeMd } from "@/lib/reporte-md";
import { PanelDesbloqueo } from "./desbloquear";
import { Predicciones } from "./predicciones";
import { GenerandoReporte } from "./generando";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [k: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const guardado = await leerReporte(id);
  if (!guardado) return { title: "Reporte no encontrado · El Pana Beto" };
  const md = guardado.reporteMd;
  const rep = md
    ? { titulo: tituloDeMd(md), gancho: ganchoDeMd(md) }
    : (guardado.reporte2 ?? guardado.reporte);
  if (!rep)
    return {
      title:
        guardado.estado === "pendiente"
          ? `El expediente de ${guardado.grupo || "tu grupo"} · El Pana Beto`
          : "Beto está escribiendo tu reporte… · El Pana Beto",
      description:
        guardado.estado === "pendiente"
          ? "El chat ya está sobre la mesa de Beto. Falta que alguien dé la orden."
          : undefined,
      robots: { index: false, follow: false },
    };
  // El gancho es la frase más intrigante. Es lo que sale en el preview de
  // WhatsApp al compartir el link.
  const respaldo =
    (md ? aperturaDeMd(md).replace(/\*\*/g, "") : undefined) ??
    guardado.reporte?.veredicto ??
    guardado.reporte2?.apertura.replace(/\*\*/g, "") ??
    "";
  const preview = (rep.gancho || respaldo).slice(0, 180);
  return {
    title: `${rep.titulo} · El Pana Beto`,
    description: preview,
    openGraph: {
      title: rep.titulo,
      description: preview,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: rep.titulo,
      description: preview,
      images: ["/opengraph-image"],
    },
    // Fuera de Google (privacidad), pero los previews sociales siguen vivos.
    robots: { index: false, follow: false },
  };
}

/* Separa el emoji inicial del título para tratarlo como ornamento, no como texto. */
function separarEmoji(titulo: string): [string | null, string] {
  const m = titulo.match(/^(\p{Extended_Pictographic}[\ufe0f\u20e3]*)\s+(.+)$/u);
  return m ? [m[1], m[2]] : [null, titulo];
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  const [emoji, texto] = separarEmoji(titulo);
  return (
    <section className="seccion mt-14 sm:mt-20">
      <header>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="seccion-num font-display text-sm font-medium italic tracking-wide text-accent"
          />
          <span aria-hidden className="h-px flex-1 bg-line" />
          {emoji && (
            <span aria-hidden className="text-lg leading-none">
              {emoji}
            </span>
          )}
        </div>
        <h2 className="font-display mt-3 text-[1.65rem] font-semibold leading-tight tracking-tight sm:text-3xl">
          {texto}
        </h2>
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}

// Teaser pre-pago (flujo v2): el reporte AÚN no se escribe; aquí solo va lo
// que el código ya sabe del chat (estadísticas reales, cero IA, cero costo).
// Beto se sienta a escribir apenas el pago entra.
function TeaserPendiente({
  id,
  guardado,
  pagos,
}: {
  id: string;
  guardado: ReporteGuardado;
  pagos: EstadoPagos | null;
}) {
  const fecha = new Date(guardado.creado).toLocaleDateString("es-PA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const etiquetaTipo =
    guardado.tipo === "profundo"
      ? "Reporte profundo"
      : guardado.tipo === "yeye"
        ? "Reporte yeye"
        : "Reporte clásico";
  const s = guardado.stats;
  const dias = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];
  const hora12 = (h: number) =>
    `${((h + 11) % 12) + 1} ${h < 12 ? "a. m." : "p. m."}`;
  const totalIntegrantes = guardado.participantes?.length ?? 0;
  const totalMsjs =
    guardado.participantes?.reduce((a, p) => a + p.mensajes, 0) || 1;
  const top = (guardado.participantes ?? []).slice(0, 3);

  const cifras: { dato: string; nota: string }[] = [
    ...(guardado.mensajes
      ? [
          {
            dato: guardado.mensajes.toLocaleString("es-PA"),
            nota: "mensajes sobre la mesa",
          },
        ]
      : []),
    ...(totalIntegrantes
      ? [
          {
            dato: String(totalIntegrantes),
            nota:
              totalIntegrantes === 1
                ? "integrante en el expediente"
                : "integrantes en el expediente",
          },
        ]
      : []),
    ...(s && s.total >= 20
      ? [
          {
            dato: hora12(s.horaPico),
            nota: `la hora en que este grupo más habla (los ${dias[s.diaSemanaPico]})`,
          },
        ]
      : []),
    ...(s?.diaRecord
      ? [
          {
            dato: s.diaRecord.cantidad.toLocaleString("es-PA"),
            nota: `mensajes en su día récord (${s.diaRecord.fecha})`,
          },
        ]
      : []),
  ];

  const bloqueado = [
    { icono: "👤", texto: "El perfil de cada integrante (el tuyo también)" },
    { icono: "🐐", texto: "La obsesión que domina este grupo" },
    { icono: "🏆", texto: "Los premios, con nombre y motivo" },
    { icono: "🗣️", texto: "El diccionario que nadie afuera entiende" },
    { icono: "🤯", texto: "LA línea más loca del chat" },
    { icono: "🚩", texto: "Green flags y red flags, sin anestesia" },
    { icono: "🔮", texto: "Cómo va a reaccionar cada uno al leer esto" },
    { icono: "🎵", texto: "La Canción del Grupo: sí, Beto también compone" },
  ];

  return (
    <article className="con-secciones mx-auto max-w-2xl px-6 py-10 sm:py-16">
      <p className="aparecer text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {etiquetaTipo} · {fecha}
      </p>
      <h1 className="aparecer aparecer-1 font-display mt-4 text-[2.1rem] font-semibold leading-[1.08] tracking-tight sm:text-[2.75rem] md:text-[3.25rem]">
        {guardado.grupo
          ? `El expediente de “${guardado.grupo}”`
          : "El expediente de tu grupo"}
      </h1>
      <p className="aparecer aparecer-1 mt-4 font-display text-xl italic leading-snug text-accent sm:text-2xl">
        El chat ya está sobre la mesa de Beto. Falta que alguien dé la orden.
      </p>

      <div className="aparecer aparecer-2 mt-7 flex items-center gap-3 border-y border-line py-4">
        <Image
          src="/beto.jpg"
          alt="Beto"
          width={44}
          height={44}
          className="rounded-full border border-line object-cover shadow-card"
        />
        <p className="text-sm text-muted">
          <span className="font-medium text-ink">Beto</span> escribe el reporte
          completo apenas se desbloquee: tarda unos minutos y esta página se
          actualiza sola.
        </p>
      </div>

      {guardado.fotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={guardado.fotoUrl}
          alt={guardado.grupo || "Foto del grupo"}
          className="aparecer aparecer-2 mt-7 w-full rounded-2xl border border-line object-cover shadow-card"
        />
      )}

      {cifras.length > 0 && (
        <Seccion titulo="📈 Lo que ya se sabe de este chat">
          <div className="grid grid-cols-2 gap-3">
            {cifras.map((c) => (
              <div
                key={c.nota}
                className="rounded-2xl border border-line p-4"
              >
                <p className="font-display text-2xl font-semibold sm:text-3xl">
                  {c.dato}
                </p>
                <p className="mt-1 text-sm text-muted">{c.nota}</p>
              </div>
            ))}
          </div>
          {top.length >= 2 && (
            <ul className="mt-4">
              {top.map((p, i) => (
                <li
                  key={p.nombre}
                  className="flex items-baseline justify-between border-b border-line py-3 last:border-0"
                >
                  <span className="text-ink-soft">
                    <span className="mr-2 text-sm text-muted">#{i + 1}</span>
                    {p.nombre}
                  </span>
                  <span className="text-sm text-muted">
                    {p.mensajes.toLocaleString("es-PA")} mensajes ·{" "}
                    {Math.round((p.mensajes / totalMsjs) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm italic text-muted">
            Esto es solo lo que dicen los números. Lo que Beto tiene que decir
            de cada uno es otra cosa.
          </p>
        </Seccion>
      )}

      <Seccion titulo="🔒 Lo que Beto va a escribir">
        <ul>
          {bloqueado.map((b) => (
            <li
              key={b.texto}
              className="flex items-center gap-3.5 border-b border-line py-3.5 text-ink-soft last:border-0"
            >
              <span aria-hidden>{b.icono}</span>
              <span className="select-none blur-[1px]">{b.texto}</span>
            </li>
          ))}
        </ul>
      </Seccion>

      <div id="desbloquear" className="scroll-mt-4" />
      <PanelDesbloqueo
        reporteId={id}
        precio={pagos?.precio ?? precioDesbloqueo()}
        precios={{
          basico: precioPlan("basico"),
          doblete: precioPlan("doblete"),
          expediente: precioPlan("expediente"),
        }}
        contexto={guardado.contexto}
        miembros={guardado.participantes?.length}
        comision={comisionConfig()}
        descuentoRef={descuentoReferido()}
        pagado={pagos ? totalPagado(pagos) : 0}
        pagos={(pagos?.pagos ?? []).map((p) => ({
          nombre: p.nombre,
          monto: p.monto,
        }))}
        porGenerar
      />
    </article>
  );
}

export default async function PaginaReporte({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const clienteConfirmoListo = !!sp.ready;

  let guardado = await leerReporte(id);
  if (!guardado) notFound();
  // Vercel Blob es eventualmente consistente: justo después de guardar "listo",
  // una lectura puede devolver "generando" varios segundos. Si el cliente ya
  // confirmó que terminó (?ready=…), reintentamos la lectura para pasar ese
  // bache, así no mostramos la carga ni entramos en bucle de recarga en Safari.
  if (clienteConfirmoListo) {
    for (
      let i = 0;
      i < 12 &&
      guardado &&
      !guardado.reporte &&
      !guardado.reporte2 &&
      !guardado.reporteMd &&
      guardado.estado !== "error";
      i++
    ) {
      await new Promise((r) => setTimeout(r, 800));
      guardado = await leerReporte(id);
    }
  }
  if (!guardado) notFound();
  // Sin reporte todavía: o el job espera el pago (flujo v2, teaser $0 con
  // estadísticas reales) o ya se pagó y Beto está escribiendo (polling).
  if (!guardado.reporte && !guardado.reporte2 && !guardado.reporteMd) {
    const chars = guardado.inputs?.chat?.length ?? 40_000;
    let pagosPend = await leerPagos(id);
    // Tras volver del checkout (?pago=ok/cancion) el JSON de pagos puede
    // tardar unos segundos en aparecer (consistencia eventual del Blob):
    // reintentar antes de decidir, para no re-mostrar el paywall ya pagado.
    if (
      (sp.pago === "ok" || sp.pago === "cancion") &&
      guardado.estado === "pendiente" &&
      !estaDesbloqueado(pagosPend)
    ) {
      for (let i = 0; i < 10 && !estaDesbloqueado(pagosPend); i++) {
        await new Promise((r) => setTimeout(r, 800));
        pagosPend = await leerPagos(id);
      }
    }

    if (guardado.estado === "pendiente" && !estaDesbloqueado(pagosPend)) {
      return (
        <TeaserPendiente
          id={id}
          guardado={guardado}
          pagos={pagosPend}
        />
      );
    }

    // Pagado (o reporte del flujo anterior): pantalla de espera con polling.
    // Estimado HONESTO según el tamaño real del chat y el modelo activo. Los
    // chats grandes pasan por etapas (lectura completa → síntesis →
    // escritura) que pueden repartirse entre varias corridas.
    const esRapido = /fast/.test(process.env.MODELO_REPORTE ?? "opus-5-fast");
    const estimado =
      chars > 150_000
        ? Math.min(900, Math.max(240, Math.round(200 + chars / 12_000)))
        : esRapido
          ? Math.min(140, Math.max(40, Math.round(35 + chars / 1500)))
          : Math.min(300, Math.max(60, Math.round(50 + chars / 700)));
    return (
      <GenerandoReporte
        id={id}
        creado={guardado.creado}
        estimado={estimado}
        waBeto={process.env.WA_NUMERO_BETO}
        igBeto={process.env.IG_USUARIO_BETO}
      />
    );
  }
  const md = guardado.reporteMd;
  const r2 = guardado.reporte2;
  const r = guardado.reporte!; // solo se usa en las ramas legacy (cuando !r2 && !md)
  // Vista normalizada para encabezado y teaser (sirve para ambos formatos).
  const doc = {
    titulo: md ? tituloDeMd(md) : (r2?.titulo ?? r.titulo),
    gancho: md ? ganchoDeMd(md) : (r2?.gancho ?? r.gancho),
    perfiles: md
      ? []
      : r2
      ? r2.perfiles.map((p) => ({
          nombre: p.nombre,
          apodo: p.apodo ?? "",
          descripcion: p.cuerpo,
        }))
      : r.perfiles,
  };
  const fecha = new Date(guardado.creado).toLocaleDateString("es-PA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const etiquetaTipo =
    guardado.tipo === "profundo"
      ? "Reporte profundo"
      : guardado.tipo === "yeye"
        ? "Reporte yeye"
        : "Reporte clásico";
  const statMensajes = guardado.mensajes
    ? ` · Beto leyó ${guardado.mensajes.toLocaleString("es-PA")} mensajes`
    : "";

  const pagos = await leerPagos(id);
  // undefined = rockola apagada; null = configurada pero sin canción aún
  const cancion = cancionConfigurada() ? await leerCancion(id) : undefined;
  if (!estaDesbloqueado(pagos)) {
    const precio = pagos?.precio ?? precioDesbloqueo();
    const pagado = pagos ? totalPagado(pagos) : 0;
    // El teaser corta a la mitad el perfil de QUIEN pidió el reporte, para
    // que quede más picado con lo suyo. Los otros 2 se muestran completos.
    const creador = guardado.nombreUsuario?.trim().toLowerCase();
    const perfilCreador = creador
      ? doc.perfiles.find(
          (p) =>
            p.nombre.toLowerCase().includes(creador) ||
            creador.includes(p.nombre.toLowerCase()),
        )
      : undefined;
    const otros = doc.perfiles.filter((p) => p !== perfilCreador);
    const completos = otros.slice(0, 2);
    const teaser = perfilCreador ?? doc.perfiles[completos.length] ?? null;
    const esCreador = !!perfilCreador;
    const restantes =
      doc.perfiles.length - completos.length - (teaser ? 1 : 0);
    const bloqueado = md
      ? [
          ...seccionesDeMd(md).map((t) => ({ icono: "🔒", texto: t })),
          {
            icono: "🎵",
            texto: "La Canción del Grupo: sí, Beto también compone",
          },
        ]
      : r2
      ? [
          { icono: "🐐", texto: `EL tema: la obsesión que domina este grupo` },
          {
            icono: "👤",
            texto: `${r2.perfiles.length} perfiles completos (el tuyo también)`,
          },
          {
            icono: "🎭",
            texto: `Los que nadie menciona pero todos toleran`,
          },
          { icono: "🏆", texto: `${r2.premios.length} premios con nombre y motivo` },
          {
            icono: "🗣️",
            texto: `El vocabulario que nadie afuera entiende`,
          },
          { icono: "🚩", texto: `Green flags y red flags, sin anestesia` },
          { icono: "🤯", texto: `LA línea más loca del chat` },
          {
            icono: "🔮",
            texto: `Cómo va a reaccionar cada uno al leer esto`,
          },
          {
            icono: "🎵",
            texto: `La Canción del Grupo: sí, Beto también compone`,
          },
        ]
      : [
          { icono: "🔥", texto: `${r.temas.length} temas que dominan el grupo` },
          {
            icono: "👤",
            texto: `${r.perfiles.length} perfiles con apodo (el tuyo también)`,
          },
          { icono: "🏆", texto: `${r.premios.length} premios y reconocimientos` },
          {
            icono: "✨",
            texto: `El ranking de aura: quién tiene y quién quedó debiendo`,
          },
          {
            icono: "🥊",
            texto: `Quién ganaría una pelea (y quién cae de primero)`,
          },
          {
            icono: "📊",
            texto: `Los rankings que van a poner a pelear al grupo`,
          },
          {
            icono: "🗣️",
            texto: `Diccionario del grupo (${r.vocabulario.length} términos)`,
          },
          {
            icono: "🚩",
            texto: `${r.banderasVerdes.length} green flags y ${r.banderasRojas.length} red flags`,
          },
          { icono: "🤯", texto: `${r.frases.length} frases célebres, con contexto` },
          {
            icono: "🔮",
            texto: `Cómo va a reaccionar cada uno al leer esto`,
          },
          {
            icono: "🎵",
            texto: `La Canción del Grupo: sí, Beto también compone`,
          },
        ];
    return (
      <article className="con-secciones mx-auto max-w-2xl px-6 py-10 sm:py-16">
        <p className="aparecer text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {etiquetaTipo} · {fecha}
          {statMensajes}
        </p>
        <h1 className="aparecer aparecer-1 font-display mt-4 text-[2.1rem] font-semibold leading-[1.08] tracking-tight sm:text-[2.75rem] md:text-[3.25rem]">
          {doc.titulo}
        </h1>

        {doc.gancho && (
          <p className="aparecer aparecer-1 mt-4 font-display text-xl italic leading-snug text-accent sm:text-2xl">
            {doc.gancho}
          </p>
        )}

        <div className="aparecer aparecer-2 mt-7 flex items-center gap-3 border-y border-line py-4">
          <Image
            src="/beto.jpg"
            alt="Beto"
            width={44}
            height={44}
            className="rounded-full border border-line object-cover shadow-card"
          />
          <p className="text-sm text-muted">
            Por <span className="font-medium text-ink">Beto</span>, que se leyó
            todo el bochinche
          </p>
        </div>

        {md ? (
          <div className="mt-9 text-lg leading-8 sm:text-[1.13rem]">
            <ProsaV2
              texto={aperturaDeMd(md)}
              claseParrafo="leading-8 text-ink-soft sm:leading-9"
            />
          </div>
        ) : r2 ? (
          <div className="mt-9 text-lg leading-8 sm:text-[1.13rem]">
            <ProsaV2
              texto={r2.apertura}
              claseParrafo="leading-8 text-ink-soft sm:leading-9"
            />
          </div>
        ) : (
          <p className="capitular mt-9 text-lg leading-8 text-ink-soft sm:text-[1.19rem] sm:leading-9">
            {r.veredicto}
          </p>
        )}

        {completos.length > 0 && (
          <Seccion titulo="👤 Los integrantes, según Beto">
            <div className="space-y-4">
              {completos.map((p) => (
                <div
                  key={p.nombre}
                  className="rounded-xl border border-line bg-card p-5 shadow-card sm:p-6"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h3 className="font-display text-lg font-semibold">
                      {p.nombre}
                    </h3>
                    <span className="font-display text-sm italic text-accent">
                      “{p.apodo}”
                    </span>
                  </div>
                  <div className="mt-2 text-muted">
                    <ProsaV2
                      texto={p.descripcion}
                      claseParrafo="leading-relaxed text-muted"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Seccion>
        )}

        {teaser && (
          <div className="relative mt-4 overflow-hidden rounded-xl border border-line bg-card p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h3 className="font-display text-lg font-semibold">
                {teaser.nombre}
              </h3>
              <span className="font-display text-sm italic text-accent">
                “{teaser.apodo}”
              </span>
            </div>
            <p className="mt-2 leading-relaxed text-muted">
              {teaser.descripcion
                .slice(0, Math.ceil(teaser.descripcion.length / 2))
                .replace(/\*\*/g, "")
                .replace(/^>\s?/gm, "")}
              …
            </p>
            <div className="absolute inset-0 flex flex-col items-center justify-end gap-2.5 bg-gradient-to-b from-transparent via-card/60 to-card pb-5">
              <p className="rounded-full border border-line bg-paper px-4 py-1.5 text-center text-sm font-medium shadow-card">
                {esCreador
                  ? "🔒 Sí, esto es lo que Beto dijo de TI"
                  : "🔒 Y justo cuando se estaba poniendo bueno…"}
              </p>
              <a
                href="#desbloquear"
                className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-paper shadow-boton transition-transform hover:-translate-y-0.5"
              >
                Ver el reporte completo →
              </a>
            </div>
          </div>
        )}
        {restantes > 0 && (
          <p className="mt-3 text-sm italic text-muted">
            …y {restantes} perfil{restantes > 1 ? "es" : ""} más esperando bajo
            llave.
          </p>
        )}

        <Seccion titulo="🔒 Lo que falta por desbloquear">
          <ul>
            {bloqueado.map((b) => (
              <li
                key={b.texto}
                className="flex items-center gap-3.5 border-b border-line py-3.5 text-ink-soft last:border-0"
              >
                <span aria-hidden>{b.icono}</span>
                <span className="select-none blur-[1px]">{b.texto}</span>
              </li>
            ))}
          </ul>
        </Seccion>

        <div id="desbloquear" className="scroll-mt-4" />
        <PanelDesbloqueo
          reporteId={id}
          precio={precio}
          precios={{
            basico: precioPlan("basico"),
            doblete: precioPlan("doblete"),
            expediente: precioPlan("expediente"),
          }}
          contexto={guardado.contexto}
          miembros={guardado.participantes?.length}
          comision={comisionConfig()}
          descuentoRef={descuentoReferido()}
          pagado={pagado}
          pagos={(pagos?.pagos ?? []).map((p) => ({
            nombre: p.nombre,
            monto: p.monto,
          }))}
        />
      </article>
    );
  }

  return (
    <article className="con-secciones mx-auto max-w-2xl px-6 py-10 sm:py-16">
      {sp.pago === "ok" && <ScrollArriba />}
      <p className="aparecer text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {etiquetaTipo} · {fecha}
        {statMensajes}
      </p>
      <h1 className="aparecer aparecer-1 font-display mt-4 text-[2.1rem] font-semibold leading-[1.08] tracking-tight sm:text-[2.75rem] md:text-[3.25rem]">
        {doc.titulo}
      </h1>

      {doc.gancho && (
        <p className="aparecer aparecer-1 mt-4 font-display text-lg italic leading-snug text-accent sm:text-xl">
          {doc.gancho}
        </p>
      )}

      {guardado.mensajes && (
        <div className="aparecer aparecer-1 mt-6 flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <p className="font-display text-3xl font-semibold text-accent sm:text-4xl">
              {guardado.mensajes.toLocaleString("es-PA")}
            </p>
            <p className="text-xs uppercase tracking-widest text-muted">
              mensajes leídos
            </p>
          </div>
          {guardado.participantes && guardado.participantes.length > 0 && (
            <div>
              <p className="font-display text-3xl font-semibold sm:text-4xl">
                {guardado.participantes.length}
              </p>
              <p className="text-xs uppercase tracking-widest text-muted">
                bajo la lupa
              </p>
            </div>
          )}
        </div>
      )}

      <div className="aparecer aparecer-2 mt-7 flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
        <div className="flex items-center gap-3">
          <Image
            src="/beto.jpg"
            alt="Beto"
            width={44}
            height={44}
            className="rounded-full border border-line object-cover shadow-card"
          />
          <p className="text-sm text-muted">
            Por <span className="font-medium text-ink">Beto</span>, que se leyó
            todo el bochinche
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BotonWhatsApp mensaje="“El expediente del grupo quedó abierto. Nadie se salva.” El Pana Beto 💀" />
          <BotonCompartir />
          <BotonCompartirImagen reporteId={id} />
        </div>
      </div>

      {guardado.fotoUrl && (
        <figure className="mt-8 rounded-xl border border-line bg-card p-2 shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={guardado.fotoUrl}
            alt={`Foto del grupo ${guardado.grupo}`}
            className="max-h-80 w-full rounded-lg object-cover"
          />
        </figure>
      )}

      {/* FORMATO V2 (clon Brandon): documento que fluye con burbujas de chat.
          Los reportes viejos siguen con el renderizado legacy de abajo. */}
      {md ? (
        <ReporteMd md={md} />
      ) : r2 ? (
        <ReporteV2Completo r={r2} grupo={guardado.grupo} />
      ) : (
        <>
      <p className="capitular mt-10 text-lg leading-8 text-ink-soft sm:text-[1.19rem] sm:leading-9">
        {r.veredicto}
      </p>

      {/* Orden: lo más chistoso ARRIBA (perfiles, premios, frases); análisis,
          números y códigos al fondo. Que nadie se aburra antes del oro. */}
      <Seccion titulo="👤 Los integrantes, según Beto">
        <div className="space-y-6">
          {r.perfiles.map((p) => (
            <div
              key={p.nombre}
              className="rounded-xl border border-line bg-card p-5 shadow-card sm:p-6"
            >
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="font-display text-lg font-semibold">
                  {p.nombre}
                </h3>
                <span className="font-display text-sm italic text-accent">
                  “{p.apodo}”
                </span>
              </div>
              <p className="mt-2 leading-relaxed text-muted">{p.descripcion}</p>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="🏆 Premios y reconocimientos">
        <ul className="space-y-4">
          {r.premios.map((p) => (
            <li key={p.premio} className="border-b border-line pb-4 last:border-0">
              <p className="font-medium">
                {p.premio}:{" "}
                <span className="font-display italic text-accent">
                  {p.ganador}
                </span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{p.motivo}</p>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion titulo="🤯 Frases célebres">
        <div className="space-y-8">
          {r.frases.map((f) => (
            <blockquote
              key={f.frase}
              className="border-l-2 border-accent pl-5 sm:pl-6"
            >
              <p className="font-display text-xl italic leading-snug sm:text-[1.4rem]">
                “{f.frase}”
              </p>
              <footer className="mt-3">
                <span className="text-sm font-medium text-ink">
                  {f.autor}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">
                  {f.contexto}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </Seccion>

      {r.aura && r.aura.length > 0 && (
        <Seccion titulo="✨ El ranking de aura">
          <ol className="space-y-4">
            {r.aura.map((a, i) => (
              <li
                key={a.nombre}
                className="flex items-baseline gap-4 border-b border-line pb-4 last:border-0"
              >
                <span
                  className={`font-display w-9 shrink-0 text-xl font-semibold italic ${i === 0 ? "text-accent" : "text-muted"}`}
                >
                  {i + 1}º
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-medium">{a.nombre}</span>
                    <span
                      className={`font-semibold tabular-nums ${a.puntos < 0 ? "text-accent" : "text-verde"}`}
                    >
                      {a.puntos >= 0 ? "+" : "−"}
                      {Math.abs(a.puntos).toLocaleString("es-PA")} aura
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {a.motivo}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Seccion>
      )}

      {r.peleas && r.peleas.length > 0 && (
        <Seccion titulo="🥊 Quién ganaría una pelea">
          {(() => {
            const campeon = r.peleas[0];
            const ultimo =
              r.peleas.length > 1 ? r.peleas[r.peleas.length - 1] : null;
            const medio = r.peleas.slice(1, ultimo ? -1 : undefined);
            return (
              <div className="space-y-4">
                {/* Campeón: el más peligroso, destacado */}
                <div className="rounded-2xl border-2 border-accent bg-accent/[0.06] p-5 shadow-card">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
                    <span className="text-lg">🏆</span> El más peligroso
                  </div>
                  <p className="font-display mt-2 text-2xl font-semibold">
                    {campeon.nombre}
                  </p>
                  <p className="mt-1.5 leading-relaxed text-ink-soft">
                    {campeon.motivo}
                  </p>
                </div>

                {/* El montón: tarjetas compactas con su puesto */}
                {medio.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {medio.map((p, i) => (
                      <div
                        key={p.nombre}
                        className="rounded-xl border border-line bg-card p-4 shadow-card"
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-lg font-semibold italic text-muted">
                            #{i + 2}
                          </span>
                          <p className="font-medium">{p.nombre}</p>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {p.motivo}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* El que cae de primero: el remate */}
                {ultimo && (
                  <div className="rounded-2xl border border-dashed border-line bg-paper p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
                      <span className="text-lg">💀</span> Cae de primero
                    </div>
                    <p className="font-display mt-2 text-xl font-semibold text-muted line-through decoration-accent/60 decoration-2">
                      {ultimo.nombre}
                    </p>
                    <p className="mt-1.5 leading-relaxed text-ink-soft">
                      {ultimo.motivo}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </Seccion>
      )}

      {r.listas?.map((lista) => (
        <Seccion key={lista.titulo} titulo={lista.titulo}>
          <ol className="space-y-3">
            {lista.items.map((item, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span className="font-display w-5 shrink-0 font-semibold italic text-accent">
                  {i + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </Seccion>
      ))}

      {r.vocabulario.length > 0 && (
        <Seccion titulo="🗣️ Diccionario del grupo">
          <dl className="space-y-5">
            {r.vocabulario.map((v) => (
              <div
                key={v.termino}
                className="border-b border-line pb-5 last:border-0 last:pb-0"
              >
                <dt className="font-display text-lg font-semibold">
                  {v.termino}
                </dt>
                <dd className="mt-1 leading-relaxed text-muted">
                  {v.definicion}
                </dd>
              </div>
            ))}
          </dl>
        </Seccion>
      )}

      <Seccion titulo="🚩 Flags">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-verde/25 bg-verde/[0.05] p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-verde">
              Green flags
            </h3>
            <ul className="mt-4 space-y-2.5">
              {r.banderasVerdes.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="shrink-0 text-verde">＋</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-accent/25 bg-accent/[0.05] p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Red flags
            </h3>
            <ul className="mt-4 space-y-2.5">
              {r.banderasRojas.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="shrink-0 text-accent">－</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="🔥 Los temas del grupo">
        <div className="space-y-6">
          {r.temas.map((t) => (
            <div key={t.titulo}>
              <h3 className="font-display text-lg font-semibold">{t.titulo}</h3>
              <p className="mt-1 leading-relaxed text-muted">{t.descripcion}</p>
            </div>
          ))}
        </div>
      </Seccion>
        </>
      )}

      {((guardado.stats && guardado.stats.total >= 20) ||
        (guardado.participantes && guardado.participantes.length >= 2)) && (
        <div className="mt-10 rounded-xl border border-line bg-card p-5 shadow-card">
          <p className="font-display font-semibold">
            📊 ¿Quieres los números del chat?
          </p>
          <p className="mt-1 text-sm text-muted">
            Quién carga el grupo, a qué horas viven pegados, el día récord.
            Los datos duros están aparte, pa&rsquo; no cortar el bochinche.
          </p>
          <Link
            href={`/r/${id}/estadisticas`}
            className="mt-3 inline-block text-sm font-medium text-accent underline transition-colors hover:text-ink"
          >
            Ver las estadísticas completas →
          </Link>
        </div>
      )}

      {pagos?.cupones && pagos.cupones.length > 0 && (
        <div className="mt-9 rounded-xl border border-dashed border-accent/40 bg-card p-5 shadow-card">
          <p className="font-display font-semibold">
            🎟️ Tus códigos pa&rsquo;l próximo bochinche
          </p>
          <p className="mt-1 text-sm text-muted">
            Cada uno desbloquea el reporte de otro chat. Úsalos en el botón
            “¿Tienes un código de Beto?”.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2">
            {pagos.cupones.map((c) => (
              <span
                key={c}
                className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-sm tracking-wide"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {pagosConfigurados() && (
        <div className="mt-5 rounded-xl border border-dashed border-accent/40 bg-card p-5 shadow-card">
          <p className="font-display font-semibold">🤝 Tu código de pana</p>
          <p className="mt-1 text-sm text-muted">
            Regala ${descuentoReferido().toFixed(2)} de descuento a cualquier
            otro grupo. Y cuando {USOS_PARA_CORTESIA} grupos lo usen, Beto te
            debe un reporte de cortesía. Te aparece aquí solito.
          </p>
          <div className="mt-3.5">
            <span className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-sm tracking-wide">
              {await obtenerCodigoPana(id)}
            </span>
          </div>
        </div>
      )}

      {/* Predicciones legacy (v2 las trae dentro de su propio documento). */}
      {!md && !r2 && r?.predicciones && r.predicciones.length > 0 && (
        <Seccion titulo="🔮 Cómo van a reaccionar a este reporte">
          <Predicciones items={r.predicciones} />
        </Seccion>
      )}

      {cancion !== undefined && (
        <Seccion titulo="🎵 La Canción del Grupo">
          <CancionDelGrupo
            reporteId={id}
            precio={precioCancion()}
            comprada={cancionComprada(pagos)}
            previewUrl={cancion?.previewUrl}
            completaUrl={cancion?.completaUrl}
            generoInicial={cancion?.genero}
          />
        </Seccion>
      )}

      <div className="mt-16 rounded-2xl bg-ink px-6 py-10 text-center shadow-panel sm:mt-20 sm:px-10 sm:py-12">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-paper/50">
          El bochinche no se acaba aquí
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-paper">
          ¿Cuál chat sigue?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-paper/65">
          El de la familia, el de la ex, el del trabajo… Beto los lee todos.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/nuevo"
            className="inline-block rounded-full bg-accent px-6 py-3 font-medium text-paper shadow-boton transition-all duration-200 ease-suave hover:-translate-y-0.5 active:translate-y-0"
          >
            Pedir otro reporte
          </Link>
          <BotonCompartir variante="oscuro" />
          <BotonCompartirImagen reporteId={id} variante="oscuro" />
        </div>
      </div>
    </article>
  );
}
