"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const mensajesEspera = [
  "Beto está abriendo el chat…",
  "Leyendo el bochinche completo…",
  "Beto encontró algo interesante…",
  "Tomando nota de los apodos…",
  "Beto se está riendo solo…",
  "Beto fue por un raspao, ya vuelve…",
  "Redactando el veredicto…",
  "Puliendo las banderas rojas…",
];

export default function NuevoReporte() {
  const router = useRouter();
  const [grupo, setGrupo] = useState("");
  const [tipo, setTipo] = useState<"clasico" | "profundo">("clasico");
  const [chat, setChat] = useState("");
  const [archivo, setArchivo] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajeIdx, setMensajeIdx] = useState(0);
  const inputArchivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cargando) return;
    const t = setInterval(
      () => setMensajeIdx((i) => (i + 1) % mensajesEspera.length),
      4000,
    );
    return () => clearInterval(t);
  }, [cargando]);

  async function leerArchivo(f: File) {
    const texto = await f.text();
    setChat(texto);
    setArchivo(f.name);
    setError("");
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (chat.trim().length < 500) {
      setError(
        "Beto necesita más material: sube el archivo exportado o pega una conversación más larga.",
      );
      return;
    }
    setCargando(true);
    try {
      const res = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grupo, tipo, chat }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error inesperado");
      router.push(`/r/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/beto.jpg"
          alt="Beto"
          className="h-20 w-20 rounded-full border border-line object-cover"
        />
        <div className="mt-6 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
        <h1 className="font-display mt-8 text-3xl font-semibold">
          {mensajesEspera[mensajeIdx]}
        </h1>
        <p className="mt-4 text-muted">
          Esto toma unos minutos. No cierres esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Pásale el chat a Beto
      </h1>
      <p className="mt-3 text-muted">
        Exporta el chat desde WhatsApp (Sin archivos) y súbelo aquí, o pega la
        conversación directamente.
      </p>

      <form onSubmit={enviar} className="mt-10 space-y-8">
        <div>
          <label htmlFor="grupo" className="block text-sm font-medium">
            Nombre del grupo
          </label>
          <input
            id="grupo"
            type="text"
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
            placeholder="Ej: Los Panas del Barrio"
            className="mt-2 w-full rounded-md border border-line bg-card px-4 py-3 outline-none transition-colors focus:border-accent"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Tipo de reporte</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["clasico", "Clásico", "Humor al frente, verdades bien puestas."],
                ["profundo", "Profundo", "Menos chiste, más análisis real."],
              ] as const
            ).map(([valor, nombre, desc]) => (
              <label
                key={valor}
                className={`cursor-pointer rounded-md border p-4 transition-colors ${
                  tipo === valor
                    ? "border-accent bg-card"
                    : "border-line bg-transparent hover:border-muted"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={valor}
                  checked={tipo === valor}
                  onChange={() => setTipo(valor)}
                  className="sr-only"
                />
                <span className="font-display block font-semibold">{nombre}</span>
                <span className="mt-1 block text-sm text-muted">{desc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="block text-sm font-medium">El chat</label>
          <div className="mt-2 space-y-3">
            <button
              type="button"
              onClick={() => inputArchivo.current?.click()}
              className="w-full rounded-md border border-dashed border-muted px-4 py-6 text-center text-sm text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {archivo
                ? `Archivo cargado: ${archivo}`
                : "Subir el archivo exportado (.txt o .zip descomprimido)"}
            </button>
            <input
              ref={inputArchivo}
              type="file"
              accept=".txt,text/plain"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) leerArchivo(f);
              }}
            />
            <textarea
              value={archivo ? "" : chat}
              onChange={(e) => {
                setChat(e.target.value);
                setArchivo("");
              }}
              placeholder="…o pega la conversación aquí"
              rows={8}
              className="w-full rounded-md border border-line bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              disabled={!!archivo}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-accent px-6 py-4 font-medium text-paper transition-transform hover:-translate-y-0.5"
        >
          Que Beto lo lea
        </button>
        <p className="text-center text-xs text-muted">
          El chat se procesa una sola vez para generar el reporte y no se usa
          para entrenar ningún modelo.
        </p>
      </form>
    </div>
  );
}
