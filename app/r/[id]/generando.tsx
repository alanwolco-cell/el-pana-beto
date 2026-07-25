"use client";

import { useEffect, useState } from "react";

const mensajes = [
  "Beto está abriendo el chat…",
  "Leyendo el bochinche completo…",
  "Beto encontró algo interesante…",
  "Tomando nota de los apodos…",
  "Beto se está riendo solo…",
  "Beto fue por un raspao, ya vuelve…",
  "Redactando el veredicto…",
  "Puliendo los flags rojos…",
];

const ESTIMADO = 45; // segundos estimados (con margen sobre los ~25-40 reales)

export function GenerandoReporte({ id }: { id: string }) {
  const [idx, setIdx] = useState(0);
  const [falló, setFalló] = useState(false);
  const [seg, setSeg] = useState(0);

  useEffect(() => {
    const rot = setInterval(() => setIdx((i) => (i + 1) % mensajes.length), 4000);
    const tic = setInterval(() => setSeg((s) => s + 1), 1000);
    return () => {
      clearInterval(rot);
      clearInterval(tic);
    };
  }, []);

  // Progreso que avanza hacia ~95% y se queda ahí hasta que de verdad termina.
  const progreso = Math.min(95, Math.round((seg / ESTIMADO) * 100));
  const faltan = Math.max(0, ESTIMADO - seg);

  useEffect(() => {
    let vivo = true;
    async function revisar() {
      try {
        const r = await fetch(`/api/reportes/estado?id=${id}`, {
          cache: "no-store",
        });
        const d = await r.json();
        if (!vivo) return;
        if (d.estado === "listo") {
          window.location.reload();
          return;
        }
        if (d.estado === "error") {
          setFalló(true);
          return;
        }
      } catch {
        // sin conexión momentánea: seguimos intentando
      }
      if (vivo) setTimeout(revisar, 3000);
    }
    const t = setTimeout(revisar, 3000);
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [id]);

  if (falló) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/beto.jpg"
          alt="Beto"
          className="h-20 w-20 rounded-full border border-line object-cover"
        />
        <h1 className="font-display mt-6 text-3xl font-semibold">
          A Beto se le trabó el lápiz
        </h1>
        <p className="mt-4 text-muted">
          Algo falló al escribir el reporte. No te preocupes, no se cobró nada.
          Intenta de nuevo.
        </p>
        <a
          href="/nuevo"
          className="mt-8 rounded-full bg-accent px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-0.5"
        >
          Pedir otro reporte
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/beto.jpg"
        alt="Beto"
        className="h-20 w-20 rounded-full border border-line object-cover"
      />
      <h1 className="font-display mt-8 text-3xl font-semibold">
        {mensajes[idx]}
      </h1>

      <div className="mt-8 w-full max-w-sm">
        <div className="h-2.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-all duration-1000 ease-linear"
            style={{ width: `${progreso}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted">
          {progreso < 95
            ? `${progreso}% · le faltan como ${faltan}s`
            : "Ya casi… dándole los últimos toques"}
        </p>
      </div>

      <p className="mt-6 text-muted">
        Puedes salir de la página tranquilo: cuando vuelvas, tu reporte va a
        estar aquí. Ya guardamos el link.
      </p>
    </div>
  );
}
