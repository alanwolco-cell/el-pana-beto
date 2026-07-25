"use client";

import { useState } from "react";

export function BotonCompartirImagen({ reporteId }: { reporteId: string }) {
  const [estado, setEstado] = useState<
    "listo" | "generando" | "error"
  >("listo");

  async function compartir() {
    if (estado === "generando") return;
    setEstado("generando");
    try {
      const res = await fetch(`/r/${reporteId}/tarjeta`);
      if (!res.ok) throw new Error("no se pudo generar la tarjeta");
      const blob = await res.blob();
      const archivo = new File([blob], "reporte-el-pana-beto.png", {
        type: "image/png",
      });

      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [archivo] })
      ) {
        try {
          await navigator.share({ files: [archivo], title: document.title });
          setEstado("listo");
          return;
        } catch {
          // el usuario canceló — no forzar la descarga
          setEstado("listo");
          return;
        }
      }

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "reporte-el-pana-beto.png";
      enlace.click();
      URL.revokeObjectURL(url);
      setEstado("listo");
    } catch {
      setEstado("error");
      setTimeout(() => setEstado("listo"), 2500);
    }
  }

  return (
    <button
      onClick={compartir}
      disabled={estado === "generando"}
      className="rounded-full border border-ink px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-paper disabled:opacity-60"
    >
      {estado === "generando"
        ? "Preparando la tarjeta…"
        : estado === "error"
          ? "Algo falló, prueba otra vez"
          : "Compartir como imagen 📸"}
    </button>
  );
}
