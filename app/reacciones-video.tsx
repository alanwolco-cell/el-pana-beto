"use client";

import { useEffect, useRef, useState } from "react";

// Tira de clips verticales en el estilo ILUSTRADO de la marca (animación
// pintada, generada con IA): arte del site, no testimonios — por eso no lleva
// disclaimer. Cada tarjeta arranca sola en mudo al entrar en pantalla; un
// toque activa el sonido (solo una a la vez).
function TarjetaVideo({
  src,
  conSonido,
  alPedirSonido,
}: {
  src: string;
  conSonido: boolean;
  alPedirSonido: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = !conSonido;
    if (conSonido) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, [conSonido]);

  return (
    <button
      onClick={alPedirSonido}
      aria-label={conSonido ? "Silenciar clip" : "Escuchar clip"}
      className="group relative w-56 shrink-0 snap-center overflow-hidden rounded-2xl border border-line shadow-card sm:w-64"
    >
      <video
        ref={ref}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        className="aspect-[9/16] w-full object-cover"
      />
      <span className="absolute bottom-2.5 right-2.5 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-paper backdrop-blur">
        {conSonido ? "🔊" : "🔇"}
      </span>
    </button>
  );
}

export function ReaccionesVideo({ clips }: { clips: string[] }) {
  const [activo, setActivo] = useState<string | null>(null);
  if (!clips.length) return null;
  return (
    <div className="mt-8">
      <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {clips.map((src) => (
          <TarjetaVideo
            key={src}
            src={src}
            conSonido={activo === src}
            alPedirSonido={() => setActivo((a) => (a === src ? null : src))}
          />
        ))}
      </div>
    </div>
  );
}
