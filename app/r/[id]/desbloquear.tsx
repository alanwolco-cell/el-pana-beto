"use client";

import { useState } from "react";

type Props = {
  reporteId: string;
  precio: number;
  pagado: number;
  pagos: { nombre: string; monto: number }[];
};

export function PanelDesbloqueo({ reporteId, precio, pagado, pagos }: Props) {
  const [nombre, setNombre] = useState("");
  const [partes, setPartes] = useState(1);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const falta = Math.max(0, precio - pagado);
  const cuota = Math.max(1, Math.round((precio / partes) * 100) / 100);

  async function pagar() {
    setError("");
    setCargando(true);
    try {
      const res = await fetch("/api/pagos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reporteId, nombre, partes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error inesperado");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      setCargando(false);
    }
  }

  async function copiarLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="mt-10 rounded-lg border border-line bg-card p-8">
      <h2 className="font-display text-2xl font-semibold">
        El reporte está listo. Falta pagarle a Beto.
      </h2>
      <p className="mt-2 text-muted">
        Beto ya se leyó todo el chat y escribió el reporte completo. Se
        desbloquea para todo el grupo cuando se complete el pago.
      </p>

      <div className="mt-6">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">
            Pagado: ${pagado.toFixed(2)} de ${precio.toFixed(2)}
          </span>
          {falta > 0 && (
            <span className="text-muted">Faltan ${falta.toFixed(2)}</span>
          )}
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${Math.min(100, (pagado / precio) * 100)}%` }}
          />
        </div>
        {pagos.length > 0 && (
          <p className="mt-2 text-xs text-muted">
            Ya pusieron su parte:{" "}
            {pagos.map((p) => `${p.nombre} ($${p.monto.toFixed(2)})`).join(" · ")}
          </p>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium">
            Tu nombre (para que el grupo sepa quién pagó)
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Karla"
            className="mt-2 w-full rounded-md border border-line bg-paper px-4 py-3 outline-none transition-colors focus:border-accent"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium">¿Cómo van a pagar?</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <label
                key={n}
                className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm transition-colors ${
                  partes === n
                    ? "border-accent bg-paper font-medium"
                    : "border-line hover:border-muted"
                }`}
              >
                <input
                  type="radio"
                  name="partes"
                  checked={partes === n}
                  onChange={() => setPartes(n)}
                  className="sr-only"
                />
                {n === 1 ? "Completo" : `Entre ${n}`}
                <span className="block text-xs text-muted">
                  ${(n === 1 ? precio : Math.max(1, Math.round((precio / n) * 100) / 100)).toFixed(2)}
                  {n > 1 && " c/u"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p className="rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
            {error}
          </p>
        )}

        <button
          onClick={pagar}
          disabled={cargando}
          className="w-full rounded-full bg-accent px-6 py-4 font-medium text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {cargando ? "Abriendo pago seguro…" : `Pagar mi parte ($${cuota.toFixed(2)})`}
        </button>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted">
            Pago seguro con tarjeta vía PagueloFacil.
          </p>
          <button
            onClick={copiarLink}
            className="shrink-0 rounded-full border border-ink px-4 py-1.5 text-xs font-medium transition-colors hover:bg-ink hover:text-paper"
          >
            {copiado ? "¡Copiado!" : "Copiar link para el grupo"}
          </button>
        </div>
      </div>
    </div>
  );
}
