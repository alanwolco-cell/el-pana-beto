"use client";

// Botón "mandar al grupo por WhatsApp" vía wa.me: abre WhatsApp con un mensaje
// pre-escrito en voz de Beto + el link del reporte. No usa la API de Meta —
// cero configuración, funciona en cualquier celular.
export function BotonWhatsApp({
  mensaje,
  className,
}: {
  mensaje: string;
  className?: string;
}) {
  function abrir() {
    // origin + pathname: el link limpio del reporte, sin ?ready ni ?pago.
    const url = window.location.origin + window.location.pathname;
    const texto = `${mensaje}\n${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(texto)}`,
      "_blank",
      "noopener",
    );
  }

  return (
    <button
      onClick={abrir}
      className={
        className ??
        "rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-medium text-white shadow-boton transition-transform duration-200 ease-suave hover:-translate-y-0.5"
      }
    >
      Mandar al grupo por WhatsApp
    </button>
  );
}
