"use client";

import { useState } from "react";
import { BotonWhatsApp } from "./compartir-wa";

type Props = {
  reporteId: string;
  precio: number;
  precios: { basico: number; doblete: number; expediente: number };
  contexto?: string;
  miembros?: number;
  comision: { pct: number; fija: number };
  descuentoRef: number;
  pagado: number;
  pagos: { nombre: string; monto: number }[];
  // Flujo v2: el reporte aún no se escribe — al desbloquear, Beto arranca.
  // Cambia el copy de expectativa (no "ver el reporte" sino "que lo escriba").
  porGenerar?: boolean;
};

const planes = [
  {
    id: "basico" as const,
    nombre: "1 Reporte",
    tag: "Este chat",
    desc: "El expediente completo de este chat. Un solo link y lo lee todo el grupo.",
  },
  {
    id: "doblete" as const,
    nombre: "Combo Beto",
    tag: "Todo de una",
    desc: "El reporte completo + la canción original sobre este chat, en una sola compra.",
  },
  {
    id: "expediente" as const,
    nombre: "Modo Leyenda",
    tag: "Nadie se salva",
    desc: "Reporte + canción + un código para leerle el chat a OTRO grupo. La familia, la oficina, la ex: siguiente turno.",
  },
];

// El copy de venta se adapta al tipo de chat elegido en el wizard: no es lo
// mismo destapar a los panas que a la familia, la oficina o la pareja.
function vozGrupo(contexto?: string): {
  enGrupo: string;
  sujeto: string;
  puedeGrupo: boolean;
  boton: string;
} {
  switch (contexto) {
    case "Familia":
      return { enGrupo: "en tu familia", sujeto: "tu familia", puedeGrupo: true, boton: "Exponer a la familia" };
    case "Trabajo":
      return { enGrupo: "en la oficina", sujeto: "tus compañeros", puedeGrupo: true, boton: "Delatar a la oficina" };
    case "Grupo de panas":
      return { enGrupo: "en tu grupo", sujeto: "tus panas", puedeGrupo: true, boton: "Destapar a mis panas" };
    case "Pareja o crush":
      return { enGrupo: "", sujeto: "lo suyo", puedeGrupo: false, boton: "Ver qué dice Beto" };
    case "Mejor amig@":
      return { enGrupo: "", sujeto: "tu mejor amig@", puedeGrupo: false, boton: "Exponerlo(a) ya" };
    default:
      return { enGrupo: "en el grupo", sujeto: "el grupo", puedeGrupo: true, boton: "Ver el reporte completo" };
  }
}

export function PanelDesbloqueo({
  reporteId,
  precio,
  precios,
  contexto,
  miembros,
  comision,
  descuentoRef,
  pagado,
  pagos,
  porGenerar,
}: Props) {
  const [plan, setPlan] = useState<"basico" | "doblete" | "expediente">("basico");
  const [nombre, setNombre] = useState("");
  const [partes, setPartes] = useState(1);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [codigoAplicado, setCodigoAplicado] = useState("");

  const falta = Math.max(0, precio - pagado);
  const precioBasico = Math.max(1, precios.basico - descuento);
  // En la vaca cada quien suma su parte de la comisión de PagueloFacil.
  const conComision = (base: number) =>
    Math.round((base + base * comision.pct + comision.fija) * 100) / 100;
  const cuotaVaca = (n: number) =>
    n > 1
      ? Math.max(1, conComision(precioBasico / n))
      : Math.max(1, Math.round(precioBasico * 100) / 100);
  const cuota = plan === "basico" ? cuotaVaca(partes) : precios[plan];

  const voz = vozGrupo(contexto);
  const esGrupo = voz.puedeGrupo && (miembros ?? 0) >= 3;
  const porCabeza = esGrupo ? precioBasico / (miembros as number) : 0;
  // Idea 1 (costo por cabeza) para grupos; idea 3 (menos que una fría) para
  // chats de dos. Se personaliza con el número real de integrantes.
  const incentivo = esGrupo
    ? `Son ${miembros} ${voz.enGrupo}, fren. Sale a $${porCabeza.toFixed(2)} por cabeza destaparlos a TODOS. Hasta el raspao’ cuesta más.`
    : `Esto cuesta menos que una fría. Y la fría no le escribe una canción a ${voz.sujeto}.`;
  // Idea 6 (FOMO interno): solo aplica cuando de verdad es un grupo.
  const fomo = esGrupo
    ? `Y ojo: ${voz.enGrupo} siempre hay uno a punto de comprarlo primero. ¿Vas a dejar que ÉL maneje el roast?`
    : "";
  // Idea 2 (Beto roastea la duda): junto al nombre, en el punto de fricción.
  const dudaLinea = `¿Titubeando? Ese titubeo ya te ganó un apodo ${voz.enGrupo || "acá adentro"}.`;
  // Botón por plan; en básico usa la voz del tipo de grupo.
  const botonPlanBasico =
    // Con el reporte aún por escribir, "Ver el reporte" mentiría.
    porGenerar && /^Ver/.test(voz.boton) ? "Soltar a Beto ya" : voz.boton;
  const botonBase =
    plan === "doblete"
      ? "Que empiece el caos"
      : plan === "expediente"
        ? "Hacerlo leyenda"
        : botonPlanBasico;

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
      // Redirigir con ?pago=ok (no reload pelado): el server, al ver ese
      // param, reintenta la lectura de pagos unos segundos — sin esto, el lag
      // del blob re-mostraba el paywall con el cupón ya quemado.
      const u = new URL(window.location.href);
      u.searchParams.set("pago", "ok");
      window.location.replace(u.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      setCargando(false);
    }
  }

  return (
    <div className="mt-12 rounded-2xl border border-line bg-card p-5 shadow-panel sm:p-8">
      <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight sm:text-[1.65rem]">
        {porGenerar
          ? "Beto ya leyó el chat. Tiene el lápiz en la mano y está esperando la señal."
          : "Beto ya lo escribió todo. Está ahí, con el documento bocabajo, tomándose un café."}
      </h2>
      <p className="mt-2 text-muted">
        {porGenerar
          ? "Al desbloquear, Beto se sienta a escribir el expediente completo: tarda unos minutos y esta misma página se actualiza sola. El link es el mismo para todo el grupo."
          : "El reporte completo se abre para todo el grupo con el mismo link."}
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
              className="h-full rounded-full bg-accent transition-all duration-500 ease-suave"
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
            aria-pressed={plan === p.id}
            className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ease-suave sm:p-5 ${
              plan === p.id
                ? "border-accent bg-paper shadow-card"
                : "border-line hover:border-muted"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                  plan === p.id ? "border-accent" : "border-line"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full bg-accent transition-transform duration-200 ease-suave ${
                    plan === p.id ? "scale-100" : "scale-0"
                  }`}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display font-semibold">{p.nombre}</span>
                  <span className="font-medium tabular-nums">
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
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {p.desc}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {plan === "basico" && (
        <fieldset className="mt-6">
          <legend className="text-sm font-medium">
            ¿Pagas completo o hacen la vaca?
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <label
                key={n}
                className={`cursor-pointer rounded-lg border px-2 py-2.5 text-center text-sm transition-all duration-200 ease-suave ${
                  partes === n
                    ? "border-accent bg-paper font-medium shadow-card"
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
                  ${cuotaVaca(n).toFixed(2)}
                  {n > 1 && " c/u"}
                </span>
              </label>
            ))}
          </div>
          {partes > 1 && (
            <p className="mt-2 text-xs text-muted">
              Cada quien cubre su parte + la comisión del pago, así el reporte le
              llega completo a Beto.
            </p>
          )}
        </fieldset>
      )}

      <div className="mt-6">
        <label htmlFor="nombre" className="block text-sm font-medium">
          Tu nombre, pa&rsquo; que el grupo sepa quién fue el héroe
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Karla"
          className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 outline-none transition-colors duration-200 focus:border-accent"
        />
        <p className="mt-2 text-xs italic text-muted">{dudaLinea}</p>
      </div>

      {descuento > 0 && (
        <p className="mt-4 rounded-lg border border-verde/30 bg-verde/[0.06] px-4 py-3 text-sm text-verde">
          🤝 Código de pana aplicado: −${descuento.toFixed(2)} en El Reporte.
          Salúdame al que te lo pasó.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-accent/25 bg-accent/[0.05] px-4 py-3">
        <p className="text-sm font-medium leading-relaxed text-ink">
          {incentivo}
        </p>
        {fomo && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted">{fomo}</p>
        )}
      </div>

      <button
        onClick={pagar}
        disabled={cargando}
        className="mt-4 w-full rounded-full bg-accent px-6 py-4 font-medium text-paper shadow-boton transition-all duration-200 ease-suave hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
      >
        {cargando
          ? "Abriendo la caja registradora de Beto…"
          : plan === "basico" && partes > 1
            ? `Poner mi parte — $${cuota.toFixed(2)}`
            : `${botonBase} — $${cuota.toFixed(2)}`}
      </button>

      {plan === "basico" && descuento === 0 && descuentoRef > 0 && (
        <button
          onClick={() => setMostrarCodigo(true)}
          className="mt-3 w-full rounded-lg border border-dashed border-accent/45 bg-accent/[0.05] px-4 py-2.5 text-center text-sm leading-relaxed text-ink transition-colors duration-200 hover:border-accent/80"
        >
          🤝 ¿Algún pana ya usó a Beto? Métele su código y pagas{" "}
          <b>${Math.max(1, precios.basico - descuentoRef).toFixed(2)}</b> en vez
          de ${precios.basico.toFixed(2)}.
        </button>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {porGenerar
            ? "Pago seguro con tarjeta. Beto arranca a escribir al segundo de confirmarse."
            : "Pago seguro con tarjeta. Lo que Beto ya escribió, no lo borra nadie."}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMostrarCodigo((v) => !v)}
            className="rounded-full border border-line px-4 py-2.5 text-xs font-medium text-muted transition-colors duration-200 hover:border-muted hover:text-ink"
          >
            ¿Tienes un código de Beto?
          </button>
          <BotonWhatsApp mensaje="“Llegó el expediente del grupo. Recomiendo sentarse.” — El Pana Beto 💀" />
        </div>
      </div>

      {mostrarCodigo && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="BETO-XXXXXXXX"
            className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 font-mono text-base uppercase tracking-wide outline-none transition-colors duration-200 focus:border-accent sm:text-sm"
          />
          <button
            onClick={canjear}
            disabled={cargando}
            className="shrink-0 rounded-lg border border-ink px-4 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            Canjear
          </button>
        </div>
      )}
    </div>
  );
}
