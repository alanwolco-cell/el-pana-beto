"use client";

import { useState } from "react";

type Props = {
  reporteId: string;
  precio: number;
  precios: { basico: number; doblete: number; expediente: number };
  pagado: number;
  pagos: { nombre: string; monto: number }[];
};

const planes = [
  {
    id: "basico" as const,
    nombre: "El Reporte",
    tag: "El que todos piden",
    desc: "Este chat, completo: todos los perfiles, los premios, las banderas y las frases. Y pueden hacer la vaca entre 4.",
  },
  {
    id: "doblete" as const,
    nombre: "El Doblete",
    tag: "Pa' repetir",
    desc: "Este reporte + un código para leerle el chat a otro grupo. Porque después de este, alguien va a decir «hazle uno al de la familia».",
  },
  {
    id: "expediente" as const,
    nombre: "El Expediente",
    tag: "Modo fiscal",
    desc: "Este reporte + 4 códigos más. La familia, los frenes, el trabajo y la ex: aquí no se salva nadie.",
  },
];

export function PanelDesbloqueo({
  reporteId,
  precio,
  precios,
  pagado,
  pagos,
}: Props) {
  const [plan, setPlan] = useState<"basico" | "doblete" | "expediente">("basico");
  const [nombre, setNombre] = useState("");
  const [partes, setPartes] = useState(1);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [codigoAplicado, setCodigoAplicado] = useState("");

  const falta = Math.max(0, precio - pagado);
  const precioBasico = Math.max(1, precios.basico - descuento);
  const cuota =
    plan === "basico"
      ? Math.max(1, Math.round((precioBasico / partes) * 100) / 100)
      : precios[plan];

  async function pagar() {
    setError("");
    setCargando(true);
    try {
      const res = await fetch("/api/pagos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporteId,
          nombre,
          plan,
          partes,
          descuento: codigoAplicado,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error inesperado");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      setCargando(false);
    }
  }

  async function canjear() {
    setError("");
    setCargando(true);
    try {
      const res = await fetch("/api/pagos/canjear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reporteId, codigo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error inesperado");
      if (data.descuento) {
        setDescuento(data.descuento);
        setCodigoAplicado(data.codigo);
        setPlan("basico");
        setMostrarCodigo(false);
        setCargando(false);
        return;
      }
      window.location.reload();
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
        Beto ya lo escribió todo. Está ahí, con el documento bocabajo,
        tomándose un café.
      </h2>
      <p className="mt-2 text-muted">
        El reporte completo se abre para todo el grupo con el mismo link.
      </p>

      {pagado > 0 && (
        <div className="mt-6">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">
              La vaca va en ${pagado.toFixed(2)} de ${precio.toFixed(2)}
            </span>
            <span className="text-muted">Faltan ${falta.toFixed(2)}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.min(100, (pagado / precio) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Héroes que ya pusieron:{" "}
            {pagos.map((p) => `${p.nombre} ($${p.monto.toFixed(2)})`).join(" · ")}
          </p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {planes.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlan(p.id)}
            className={`w-full rounded-lg border p-4 text-left transition-colors ${
              plan === p.id
                ? "border-accent bg-paper"
                : "border-line hover:border-muted"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-display font-semibold">{p.nombre}</span>
              <span className="font-medium">
                {p.id === "basico" && descuento > 0 ? (
                  <>
                    <s className="mr-1.5 text-muted">
                      ${precios.basico.toFixed(2)}
                    </s>
                    ${precioBasico.toFixed(2)}
                  </>
                ) : (
                  <>${precios[p.id].toFixed(2)}</>
                )}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-accent">
              {p.tag}
            </p>
            <p className="mt-1.5 text-sm text-muted">{p.desc}</p>
          </button>
        ))}
      </div>

      {plan === "basico" && (
        <fieldset className="mt-6">
          <legend className="text-sm font-medium">
            ¿Pagas completo o hacen la vaca?
          </legend>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((n) => (
              <label
                key={n}
                className={`cursor-pointer rounded-md border px-2 py-2 text-center text-sm transition-colors ${
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
                  ${Math.max(1, Math.round((precioBasico / n) * 100) / 100).toFixed(2)}
                  {n > 1 && " c/u"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6">
        <label htmlFor="nombre" className="block text-sm font-medium">
          Tu nombre — pa&rsquo; que el grupo sepa quién fue el héroe
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

      {descuento > 0 && (
        <p className="mt-4 rounded-md border border-green-700/40 bg-green-700/5 px-4 py-3 text-sm text-green-800">
          🤝 Código de pana aplicado: −${descuento.toFixed(2)} en El Reporte.
          Salúdame al que te lo pasó.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <button
        onClick={pagar}
        disabled={cargando}
        className="mt-6 w-full rounded-full bg-accent px-6 py-4 font-medium text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {cargando
          ? "Abriendo la caja registradora de Beto…"
          : plan === "basico" && partes > 1
            ? `Poner mi parte ($${cuota.toFixed(2)})`
            : `Desbloquear por $${cuota.toFixed(2)}`}
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Pago seguro con tarjeta vía PagueloFacil.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarCodigo((v) => !v)}
            className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-muted transition-colors hover:border-muted"
          >
            ¿Tienes un código de Beto?
          </button>
          <button
            onClick={copiarLink}
            className="rounded-full border border-ink px-4 py-1.5 text-xs font-medium transition-colors hover:bg-ink hover:text-paper"
          >
            {copiado ? "¡Copiado!" : "Mandar el link al grupo"}
          </button>
        </div>
      </div>

      {mostrarCodigo && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="BETO-XXXXXXXX"
            className="w-full rounded-md border border-line bg-paper px-4 py-2.5 text-sm uppercase outline-none transition-colors focus:border-accent"
          />
          <button
            onClick={canjear}
            disabled={cargando}
            className="shrink-0 rounded-md border border-ink px-4 py-2.5 text-sm font-medium transition-colors hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            Canjear
          </button>
        </div>
      )}
    </div>
  );
}
