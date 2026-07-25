"use client";

import { useState } from "react";

type Props = { variante?: "claro" | "oscuro" };

export function BotonCompartir({ variante = "claro" }: Props) {
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch {
        // el usuario canceló — cae al copiado
      }
    }
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      onClick={compartir}
      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
        variante === "oscuro"
          ? "border-paper/30 text-paper hover:bg-paper hover:text-ink"
          : "border-ink hover:bg-ink hover:text-paper"
      }`}
    >
      {copiado ? "¡Enlace copiado!" : "Compartir"}
    </button>
  );
}
