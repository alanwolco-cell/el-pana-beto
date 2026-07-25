"use client";

import { useState } from "react";

type Prediccion = { nombre: string; reaccion: string };

export function Predicciones({ items }: { items: Prediccion[] }) {
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <div className="rounded-lg border border-line bg-card p-6 text-center sm:p-8">
        <p className="font-display text-lg font-semibold">
          Beto ya sabe cómo va a reaccionar cada uno a este reporte.
        </p>
        <p className="mt-1 text-sm text-muted">
          Léelo antes de mandar el link al grupo… o después, pa&rsquo;
          comprobar que Beto no falla.
        </p>
        <button
          onClick={() => setAbierto(true)}
          className="mt-5 w-full rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent sm:w-auto"
        >
          🔮 Revelar predicciones
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((p) => (
        <li key={p.nombre} className="border-b border-line pb-4 last:border-0">
          <p className="font-medium">{p.nombre}</p>
          <p className="mt-0.5 leading-relaxed text-muted">{p.reaccion}</p>
        </li>
      ))}
    </ul>
  );
}
