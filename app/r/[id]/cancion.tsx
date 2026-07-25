"use client";

import { useEffect, useState } from "react";

const GENEROS = [
  "Plena",
  "Reggaetón",
  "Típico panameño",
  "Salsa",
  "Balada de despecho",
  "Rock en español",
];

const esperas = [
  "Beto está afinando la garganta…",
  "Buscando la clave 🥁…",
  "Beto está ensayando el coro…",
  "Ajustando el tumbao…",
];

type Props = {
  reporteId: string;
  precio: number;
  comprada: boolean;
  previewUrl?: string;
  completaUrl?: string;
  generoInicial?: string;
};

export function CancionDelGrupo({
  reporteId,
  precio,
  comprada,
  previewUrl: previewInicial,
  completaUrl: completaInicial,
  generoInicial,
}: Props) {
  const [genero, setGenero] = useState(generoInicial ?? "Plena");
  const [previewUrl, setPreviewUrl] = useState(previewInicial);
  const [completaUrl, setCompletaUrl] = useState(completaInicial);
  const [cargando, setCargando] = useState(false);
  const [esperaIdx, setEsperaIdx] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cargando) return;
    const t = setInterval(
      () => setEsperaIdx((i) => (i + 1) % esperas.length),
      3500,
    );
    return () => clearInterval(t);
  }, [cargando]);

  // Si ya la compraron y solo existe el preview, Beto graba la completa solo.
  useEffect(() => {
    if (comprada && previewUrl && !completaUrl && !cargando) {
      generarCompleta();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function llamar(ruta: string, cuerpo: object) {
    setError("");
    setCargando(true);
    try {
      const res = await fetch(ruta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error inesperado");
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      return null;
    } finally {
      setCargando(false);
    }
  }

  async function generarPreview() {
    const data = await llamar("/api/cancion", { reporteId, genero });
    if (data?.previewUrl) setPreviewUrl(data.previewUrl);
  }

  async function generarCompleta() {
    const data = await llamar("/api/cancion/completa", { reporteId });
    if (data?.completaUrl) setCompletaUrl(data.completaUrl);
  }

  async function pagarCancion() {
    const data = await llamar("/api/pagos/crear", {
      reporteId,
      plan: "cancion",
      nombre: "La Canción",
    });
    if (data?.url) window.location.href = data.url;
  }

  return (
    <div className="rounded-lg border border-line bg-card p-6">
      {cargando ? (
        <div className="flex items-center gap-4 py-4">
          <div className="h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="font-display text-lg font-semibold">
            {esperas[esperaIdx]}
          </p>
        </div>
      ) : completaUrl ? (
        <>
          <p className="text-muted">
            La completa, lista pa&rsquo;l próximo parking:
          </p>
          <audio controls src={completaUrl} className="mt-4 w-full" />
          <a
            href={completaUrl}
            download
            className="mt-3 inline-block text-sm font-medium text-accent underline"
          >
            Descargar el himno del grupo ↓
          </a>
        </>
      ) : previewUrl ? (
        <>
          <p className="text-muted">
            La canción del grupo, en {genero.toLowerCase()}. Súbele el volumen:
          </p>
          <audio controls autoPlay src={previewUrl} className="mt-4 w-full" />
          {!comprada && (
            <div className="mt-4">
              <p className="text-sm text-muted">
                ¿Se picaron? Eso fue solo el arranque. La completa trae todo
                el resto.
              </p>
              <button
                onClick={pagarCancion}
                className="mt-3 w-full rounded-full bg-accent px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-0.5"
              >
                Quiero la completa — ${precio.toFixed(2)}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-muted">
            Beto también compone. Elige el género y le hace un himno al grupo
            con los apodos y las vergüenzas de cada quien.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {GENEROS.map((g) => (
              <button
                key={g}
                onClick={() => setGenero(g)}
                className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                  genero === g
                    ? "border-accent bg-paper font-medium"
                    : "border-line hover:border-muted"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <button
            onClick={generarPreview}
            className="mt-5 w-full rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent sm:w-auto"
          >
            🎵 Que Beto la componga
          </button>
        </>
      )}
      {error && (
        <p className="mt-4 rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
