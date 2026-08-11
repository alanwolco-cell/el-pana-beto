"use client";

import { useEffect } from "react";

// Tras volver del pago, el navegador "spawnea" al fondo (donde estaba el botón
// de pagar). El reporte recién desbloqueado se lee desde el título: subimos.
export function ScrollArriba() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    // Limpia ?pago=… de la URL (un refresh no debe re-disparar nada raro).
    const u = new URL(window.location.href);
    if (u.searchParams.has("pago")) {
      u.searchParams.delete("pago");
      window.history.replaceState({}, "", u.pathname + (u.search || ""));
    }
  }, []);
  return null;
}
