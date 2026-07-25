"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  borrarReporteLocal,
  listarReportesLocales,
  type ReporteLocal,
} from "@/lib/mis-reportes";

export default function MisReportes() {
  const [reportes, setReportes] = useState<ReporteLocal[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setReportes(listarReportesLocales());
    setListo(true);
  }, []);

  function borrar(id: string) {
    borrarReporteLocal(id);
    setReportes(listarReportesLocales());
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Mis reportes
      </h1>
      <p className="mt-3 text-muted">
        Todos los reportes que has pedido desde este teléfono. Se guardan solos,
        sin cuenta ni nada.
      </p>

      {listo && reportes.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-line bg-card p-8 text-center">
          <p className="text-muted">Todavía no has pedido ningún reporte.</p>
          <Link
            href="/nuevo"
            className="mt-5 inline-block rounded-full bg-accent px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            Pedir el primero
          </Link>
        </div>
      )}

      {reportes.length > 0 && (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {reportes.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <Link href={`/r/${r.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium transition-colors hover:text-accent">
                  {r.grupo}
                </p>
                <p className="text-sm text-muted">
                  {new Date(r.fecha).toLocaleDateString("es-PA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </Link>
              <button
                onClick={() => borrar(r.id)}
                className="-m-2 shrink-0 p-2 text-sm text-muted underline transition-colors hover:text-accent"
                aria-label={`Quitar ${r.grupo} de la lista`}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-xs text-muted">
        Ojo: esta lista vive solo en este dispositivo. Si cambias de teléfono o
        borras los datos del navegador, se va. Guarda el link de los que quieras
        conservar.
      </p>
    </div>
  );
}
