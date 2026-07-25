import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  estaDesbloqueado,
  leerPagos,
  precioReporte,
  totalPagado,
} from "@/lib/pagos";
import { leerReporte } from "@/lib/storage";
import { BotonCompartir } from "./compartir";
import { PanelDesbloqueo } from "./desbloquear";

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

  const pagos = await leerPagos(id);
  if (!estaDesbloqueado(pagos)) {
    const precio = pagos?.precio ?? precioReporte();
    const pagado = pagos ? totalPagado(pagos) : 0;
    return (
      <article className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {guardado.tipo === "profundo" ? "Reporte profundo" : "Reporte clásico"}{" "}
          · {fecha}
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {r.titulo}
        </h1>
        <p className="mt-8 text-lg leading-relaxed">
          {r.veredicto.slice(0, 180)}…
        </p>
        <p className="mt-2 text-sm italic text-muted">
          — Beto, que se leyó todo y tiene mucho más que decir.
        </p>
        <PanelDesbloqueo
          reporteId={id}
          precio={precio}
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
        {guardado.tipo === "profundo" ? "Reporte profundo" : "Reporte clásico"}{" "}
        · {fecha}
      </p>
      <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        {r.titulo}
      </h1>
      <div className="mt-6 flex items-center justify-between border-y border-line py-4">
        <p className="text-sm text-muted">
          Por <span className="font-medium text-ink">Beto</span>, que se leyó
          todo el chat
        </p>
        <BotonCompartir />
      </div>

      <p className="mt-10 text-lg leading-relaxed">{r.veredicto}</p>

      <Seccion titulo="Los temas del grupo">
        <div className="space-y-6">
          {r.temas.map((t) => (
            <div key={t.titulo}>
              <h3 className="font-display text-lg font-semibold">{t.titulo}</h3>
              <p className="mt-1 leading-relaxed text-muted">{t.descripcion}</p>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Los integrantes, según Beto">
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

      <Seccion titulo="Premios y reconocimientos">
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

      {r.vocabulario.length > 0 && (
        <Seccion titulo="Diccionario del grupo">
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

      <Seccion titulo="Banderas">
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

      <Seccion titulo="Frases célebres">
        <div className="space-y-6">
          {r.frases.map((f) => (
            <blockquote
              key={f.frase}
              className="border-l-2 border-accent pl-5"
            >
              <p className="font-display text-lg">«{f.frase}»</p>
              <footer className="mt-2 text-sm text-muted">
                — {f.autor}. {f.contexto}
              </footer>
            </blockquote>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Cómo van a reaccionar a este reporte">
        <ul className="space-y-3">
          {r.predicciones.map((p) => (
            <li key={p.nombre} className="flex gap-3 leading-relaxed">
              <span className="font-medium">{p.nombre}:</span>
              <span className="text-muted">{p.reaccion}</span>
            </li>
          ))}
        </ul>
      </Seccion>

      <div className="mt-16 rounded-lg border border-line bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-semibold">
          ¿Cuál chat sigue?
        </h2>
        <p className="mt-2 text-muted">
          El de la familia, el de la ex, el del trabajo… Beto los lee todos.
        </p>
        <Link
          href="/nuevo"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-0.5"
        >
          Pedir otro reporte
        </Link>
      </div>
    </article>
  );
}
