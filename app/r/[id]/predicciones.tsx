"use client";

import { useState } from "react";

type Prediccion = { nombre: string; reaccion: string };

export function Predicciones({ items }: { items: Prediccion[] }) {
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <div className="rounded-lg border border-line bg-card p-8 text-center">
        <p className="font-display text-lg font-semibold">
          Beto ya sabe cómo va a reaccionar cada uno a este reporte.
        </p>
        <p className="mt-1 text-sm text-muted">
          Léelo antes de mandar el link al grupo… o después, pa&rsquo;
          comprobar que Beto no falla.
        </p>
        <button
          onClick={() => setAbierto(true)}
          className="mt-5 rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent"
        >
          🔮 Revelar predicciones
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((p) => (
        <li key={p.nombre} className="flex gap-3 leading-relaxed">
          <span className="font-medium">{p.nombre}:</span>
          <span className="text-muted">{p.reaccion}</span>
        </li>
      ))}
    </ul>
  );
}
