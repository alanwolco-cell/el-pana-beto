"use client";

import { useState } from "react";

export function BotonCompartir() {
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
      className="rounded-full border border-ink px-4 py-1.5 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
    >
      {copiado ? "¡Enlace copiado!" : "Compartir"}
    </button>
  );
}
