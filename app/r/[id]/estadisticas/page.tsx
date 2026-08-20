import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { leerReporte } from "@/lib/storage";
import { EstadisticasGrupo } from "../stats";

// Página aparte para el que quiere clavarse en los números después de reírse:
// el reporte principal queda puro humor, sin diluirlo con estadísticas.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const guardado = await leerReporte(id);
  return {
    title: guardado
      ? `Las estadísticas de ${guardado.grupo || "el grupo"} · El Pana Beto`
      : "Estadísticas · El Pana Beto",
    robots: { index: false, follow: false },
  };
}

export default async function PaginaEstadisticas({ params }: Props) {
  const { id } = await params;
  const guardado = await leerReporte(id);
  if (!guardado) notFound();

  const participantes = guardado.participantes ?? [];
  const total = participantes.reduce((s, p) => s + p.mensajes, 0) || 1;
  const maxN = participantes[0]?.mensajes || 1;

  return (
    <article className="con-secciones mx-auto max-w-2xl px-6 py-10 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Estadísticas del chat
      </p>
      <h1 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {guardado.grupo || "El grupo"}, en números
      </h1>
      <p className="mt-3 text-muted">
        Los datos duros detrás del reporte. Aquí no hay opinión de Beto: esto
        fue lo que ustedes mismos hicieron.
      </p>

      {participantes.length >= 2 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            💬 Quién carga el chat
          </h2>
          <ul className="mt-6 space-y-3.5">
            {participantes.map((p, i) => {
              const pct = Math.round((p.mensajes / total) * 100);
              return (
                <li key={p.nombre}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span
                      className={`truncate font-medium ${i === 0 ? "text-accent" : ""}`}
                    >
                      {i + 1}. {p.nombre}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {p.mensajes.toLocaleString("es-PA")} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full ${i === 0 ? "bg-accent" : "bg-ink/70"}`}
                      style={{
                        width: `${Math.max(3, Math.round((p.mensajes / maxN) * 100))}%`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {guardado.stats && guardado.stats.total >= 20 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            📈 El grupo en números
          </h2>
          <div className="mt-6">
            <EstadisticasGrupo stats={guardado.stats} />
          </div>
        </section>
      )}

      <div className="mt-12">
        <Link
          href={`/r/${id}`}
          className="inline-block rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent"
        >
          ← Volver al reporte
        </Link>
      </div>
    </article>
  );
}
