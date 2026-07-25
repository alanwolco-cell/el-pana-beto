"use client";

import { useState } from "react";

type Props = { reporteId: string; variante?: "claro" | "oscuro" };

export function BotonCompartirImagen({ reporteId, variante = "claro" }: Props) {
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
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-60 ${
        variante === "oscuro"
          ? "border-paper/30 text-paper hover:bg-paper hover:text-ink"
          : "border-ink hover:bg-ink hover:text-paper"
      }`}
    >
      {estado === "generando"
        ? "Preparando la tarjeta…"
        : estado === "error"
          ? "Algo falló, prueba otra vez"
          : "Compartir como imagen 📸"}
    </button>
  );
}
