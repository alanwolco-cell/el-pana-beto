"use client";

import { useEffect, useRef, useState } from "react";

// Video-nota de Beto estilo WhatsApp: burbuja circular que arranca sola (en
// silencio) cuando entra en pantalla; un toque activa el sonido y reinicia,
// otro toque pausa. El archivo se genera fuera (Higgsfield: foto de Beto +
// lipsync) y vive en /public: si no existe, la página ni renderiza esto.
export function VideoBeto({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [conSonido, setConSonido] = useState(false);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        // Autoplay mudo al entrar en pantalla; pausa al salir (ahorra batería
        // y evita que suene fuera de vista si activaron el audio).
        if (e.isIntersecting && !pausado) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, [pausado]);

  function alTocar() {
    const video = ref.current;
    if (!video) return;
    if (!conSonido) {
      // Primer toque: sonido desde el principio (lo mudo ya lo vieron).
      video.muted = false;
      video.currentTime = 0;
      setConSonido(true);
      setPausado(false);
      video.play().catch(() => {});
      return;
    }
    if (video.paused) {
      setPausado(false);
      video.play().catch(() => {});
    } else {
      setPausado(true);
      video.pause();
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-xs sm:max-w-none">
      <button
        onClick={alTocar}
        aria-label={
          conSonido ? "Pausar o reanudar el video de Beto" : "Escuchar a Beto"
        }
        className="group relative block w-full"
      >
        {/* Anillo estilo video-nota de WhatsApp */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border-[3px] border-[#25D366] opacity-80"
        />
        <video
          ref={ref}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="aspect-square w-full rounded-full border border-line object-cover shadow-sm"
        />
        {!conSonido && (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-4 py-1.5 text-sm font-medium text-paper backdrop-blur transition-transform duration-200 ease-suave group-hover:-translate-y-0.5">
            🔊 Toca pa&rsquo;l sonido
          </span>
        )}
      </button>
    </div>
  );
}
