import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cancionConfigurada, leerCancion } from "@/lib/cancion";
import {
  cancionComprada,
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
import { leerReporte } from "@/lib/storage";
import { CancionDelGrupo } from "./cancion";
import { BotonCompartir } from "./compartir";
import { PanelDesbloqueo } from "./desbloquear";
import { Predicciones } from "./predicciones";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const guardado = await leerReporte(id);
  if (!guardado) return { title: "Reporte no encontrado — El Pana Beto" };
  return {
    title: `${guardado.reporte.titulo} — El Pana Beto`,
    description: guardado.reporte.veredicto.slice(0, 160),
  };
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <h2 className="font-display border-b border-line pb-3 text-2xl font-semibold sm:text-3xl">
        {titulo}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function PaginaReporte({ params }: Props) {
  const { id } = await params;
  const guardado = await leerReporte(id);
  if (!guardado) notFound();
  const r = guardado.reporte;
  const fecha = new Date(guardado.creado).toLocaleDateString("es-PA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const etiquetaTipo =
    guardado.tipo === "profundo" ? "Reporte profundo" : "Reporte clásico";
  const statMensajes = guardado.mensajes
    ? ` · Beto leyó ${guardado.mensajes.toLocaleString("es-PA")} mensajes`
    : "";

  const pagos = await leerPagos(id);
  // undefined = rockola apagada; null = configurada pero sin canción aún
  const cancion = cancionConfigurada() ? await leerCancion(id) : undefined;
  if (!estaDesbloqueado(pagos)) {
    const precio = pagos?.precio ?? precioDesbloqueo();
    const pagado = pagos ? totalPagado(pagos) : 0;
    const primerPerfil = r.perfiles[0];
    const segundoPerfil = r.perfiles[1];
    const bloqueado = [
      { icono: "🔥", texto: `${r.temas.length} temas que dominan el grupo` },
      {
        icono: "👤",
        texto: `${r.perfiles.length} perfiles con apodo — incluido el tuyo`,
      },
      { icono: "🏆", texto: `${r.premios.length} premios y reconocimientos` },
      {
        icono: "✨",
        texto: `El ranking de aura — quién tiene y quién quedó debiendo`,
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
        texto: `${r.banderasVerdes.length} banderas verdes y ${r.banderasRojas.length} rojas`,
      },
      { icono: "🤯", texto: `${r.frases.length} frases célebres, con contexto` },
      {
        icono: "🔮",
        texto: `Cómo va a reaccionar cada uno al leer esto`,
      },
      {
        icono: "🎵",
        texto: `La Canción del Grupo — el bochinche hecho música`,
      },
    ];
    return (
      <article className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {etiquetaTipo} · {fecha}
          {statMensajes}
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {r.titulo}
        </h1>
        <div className="mt-6 flex items-center gap-3 border-y border-line py-4">
          <Image
            src="/beto.jpg"
            alt="Beto"
            width={40}
            height={40}
            className="rounded-full border border-line object-cover"
          />
          <p className="text-sm text-muted">
            Por <span className="font-medium text-ink">Beto</span>, que se leyó
            todo el bochinche
          </p>
        </div>

        <p className="mt-8 text-lg leading-relaxed">{r.veredicto}</p>

        {primerPerfil && (
          <div className="mt-10">
            <h2 className="font-display border-b border-line pb-3 text-2xl font-semibold">
              👤 Una muestra gratis, cortesía de Beto
            </h2>
            <div className="mt-6 rounded-lg border border-line bg-card p-5">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="font-display text-lg font-semibold">
                  {primerPerfil.nombre}
                </h3>
                <span className="text-sm italic text-accent">
                  «{primerPerfil.apodo}»
                </span>
              </div>
              <p className="mt-2 leading-relaxed text-muted">
                {primerPerfil.descripcion}
              </p>
            </div>
          </div>
        )}

        {segundoPerfil && (
          <div className="relative mt-4 overflow-hidden rounded-lg border border-line bg-card p-5">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h3 className="font-display text-lg font-semibold">
                {segundoPerfil.nombre}
              </h3>
              <span className="text-sm italic text-accent">
                «{segundoPerfil.apodo}»
              </span>
            </div>
            <p className="mt-2 leading-relaxed text-muted">
              {segundoPerfil.descripcion.slice(0, 90)}
            </p>
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-transparent via-card/60 to-card pb-4">
              <p className="text-sm font-medium">
                🔒 Y justo cuando se estaba poniendo bueno—
              </p>
            </div>
          </div>
        )}
        {r.perfiles.length > 2 && (
          <p className="mt-3 text-sm text-muted">
            …y {r.perfiles.length - 2} perfiles más esperando bajo llave.
          </p>
        )}

        <div className="mt-10">
          <h2 className="font-display border-b border-line pb-3 text-2xl font-semibold">
            🔒 Lo que falta por desbloquear
          </h2>
          <ul className="mt-6 space-y-3">
            {bloqueado.map((b) => (
              <li
                key={b.texto}
                className="flex items-center gap-3 rounded-lg border border-line bg-card px-4 py-3"
              >
                <span>{b.icono}</span>
                <span className="select-none blur-[1px]">{b.texto}</span>
              </li>
            ))}
          </ul>
        </div>

        <PanelDesbloqueo
          reporteId={id}
          precio={precio}
          precios={{
            basico: precioPlan("basico"),
            doblete: precioPlan("doblete"),
            expediente: precioPlan("expediente"),
          }}
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
    <article className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {etiquetaTipo} · {fecha}
        {statMensajes}
      </p>
      <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        {r.titulo}
      </h1>
      <div className="mt-6 flex items-center justify-between border-y border-line py-4">
        <div className="flex items-center gap-3">
          <Image
            src="/beto.jpg"
            alt="Beto"
            width={40}
            height={40}
            className="rounded-full border border-line object-cover"
          />
          <p className="text-sm text-muted">
            Por <span className="font-medium text-ink">Beto</span>, que se leyó
            todo el bochinche
          </p>
        </div>
        <BotonCompartir />
      </div>

      {guardado.fotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={guardado.fotoUrl}
          alt={`Foto del grupo ${guardado.grupo}`}
          className="mt-8 max-h-80 w-full rounded-lg border border-line object-cover"
        />
      )}

      <p className="mt-10 text-lg leading-relaxed">{r.veredicto}</p>

      {pagos?.cupones && pagos.cupones.length > 0 && (
        <div className="mt-8 rounded-lg border border-line bg-card p-5">
          <p className="font-display font-semibold">
            🎟️ Tus códigos pa&rsquo;l próximo bochinche
          </p>
          <p className="mt-1 text-sm text-muted">
            Cada uno desbloquea el reporte de otro chat. Úsalos en el botón
            «¿Tienes un código de Beto?».
          </p>
          <p className="mt-3 font-mono text-sm">{pagos.cupones.join(" · ")}</p>
        </div>
      )}

      {pagosConfigurados() && (
        <div className="mt-8 rounded-lg border border-line bg-card p-5">
          <p className="font-display font-semibold">🤝 Tu código de pana</p>
          <p className="mt-1 text-sm text-muted">
            Regala ${descuentoReferido().toFixed(2)} de descuento a cualquier
            otro grupo. Y cuando {USOS_PARA_CORTESIA} grupos lo usen, Beto te
            debe un reporte de cortesía — te aparece aquí solito.
          </p>
          <p className="mt-3 font-mono text-sm">{await obtenerCodigoPana(id)}</p>
        </div>
      )}

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

      <Seccion titulo="👤 Los integrantes, según Beto">
        <div className="space-y-6">
          {r.perfiles.map((p) => (
            <div
              key={p.nombre}
              className="rounded-lg border border-line bg-card p-5"
            >
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="font-display text-lg font-semibold">
                  {p.nombre}
                </h3>
                <span className="text-sm italic text-accent">«{p.apodo}»</span>
              </div>
              <p className="mt-2 leading-relaxed text-muted">{p.descripcion}</p>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="🏆 Premios y reconocimientos">
        <ul className="space-y-4">
          {r.premios.map((p) => (
            <li key={p.premio} className="border-b border-line pb-4">
              <p className="font-medium">
                {p.premio} — <span className="text-accent">{p.ganador}</span>
              </p>
              <p className="mt-1 text-sm text-muted">{p.motivo}</p>
            </li>
          ))}
        </ul>
      </Seccion>

      {r.aura && r.aura.length > 0 && (
        <Seccion titulo="✨ El ranking de aura">
          <ol className="space-y-4">
            {r.aura.map((a, i) => (
              <li
                key={a.nombre}
                className="flex items-baseline gap-4 border-b border-line pb-4"
              >
                <span className="font-display w-8 shrink-0 text-xl font-semibold text-muted">
                  {i + 1}º
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-medium">{a.nombre}</span>
                    <span
                      className={`font-semibold ${a.puntos < 0 ? "text-accent" : "text-green-700"}`}
                    >
                      {a.puntos >= 0 ? "+" : "−"}
                      {Math.abs(a.puntos).toLocaleString("es-PA")} aura
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{a.motivo}</p>
                </div>
              </li>
            ))}
          </ol>
        </Seccion>
      )}

      {r.peleas && r.peleas.length > 0 && (
        <Seccion titulo="🥊 Quién ganaría una pelea">
          <ol className="space-y-4">
            {r.peleas.map((p, i) => (
              <li
                key={p.nombre}
                className="flex items-baseline gap-4 border-b border-line pb-4"
              >
                <span className="font-display w-8 shrink-0 text-xl font-semibold text-muted">
                  {i + 1}º
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.nombre}</p>
                  <p className="mt-1 text-sm text-muted">{p.motivo}</p>
                </div>
              </li>
            ))}
          </ol>
        </Seccion>
      )}

      {r.listas?.map((lista) => (
        <Seccion key={lista.titulo} titulo={lista.titulo}>
          <ol className="space-y-3">
            {lista.items.map((item, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span className="font-display font-semibold text-accent">
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
          <dl className="space-y-4">
            {r.vocabulario.map((v) => (
              <div key={v.termino} className="flex flex-col gap-1">
                <dt className="font-display font-semibold">{v.termino}</dt>
                <dd className="text-muted">{v.definicion}</dd>
              </div>
            ))}
          </dl>
        </Seccion>
      )}

      <Seccion titulo="🚩 Banderas">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-green-700">
              Verdes
            </h3>
            <ul className="mt-3 space-y-2">
              {r.banderasVerdes.map((b) => (
                <li key={b} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-green-700">＋</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-accent">
              Rojas
            </h3>
            <ul className="mt-3 space-y-2">
              {r.banderasRojas.map((b) => (
                <li key={b} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-accent">－</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="🤯 Frases célebres">
        <div className="space-y-8">
          {r.frases.map((f) => (
            <blockquote key={f.frase} className="border-l-2 border-accent pl-5">
              <p className="font-display text-xl leading-snug">
                «{f.frase}»
              </p>
              <footer className="mt-3">
                <span className="text-sm font-medium text-ink">
                  {f.autor}
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted">
                  {f.contexto}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="🔮 Cómo van a reaccionar a este reporte">
        <Predicciones items={r.predicciones} />
      </Seccion>

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

      <div className="mt-16 rounded-lg border border-line bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-semibold">
          ¿Cuál chat sigue?
        </h2>
        <p className="mt-2 text-muted">
          El de la familia, el de la ex, el del trabajo… Beto los lee todos.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/nuevo"
            className="inline-block rounded-full bg-accent px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            Pedir otro reporte
          </Link>
          <BotonCompartir />
        </div>
      </div>
    </article>
  );
}
