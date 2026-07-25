"use client";

import { useEffect, useState } from "react";

const PASOS_TUTORIAL = [
  "1. Abre el chat y toca el nombre del grupo",
  "2. Baja hasta «Exportar chat»",
  "3. Elige «Sin archivos»",
  "4. Guárdalo y súbelo aquí abajo",
];

function Pulso() {
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
      <span className="relative inline-flex h-5 w-5 rounded-full border-2 border-white/70 bg-accent/80" />
    </span>
  );
}

export function TutorialExportar() {
  const [escena, setEscena] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setEscena((e) => (e + 1) % PASOS_TUTORIAL.length),
      3000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto mt-6 max-w-xs">
      <div className="overflow-hidden rounded-[1.5rem] border border-black/50 bg-[#0b141a] shadow-xl">
        {escena === 0 && (
          <div>
            <div className="flex items-center gap-2.5 bg-[#1f2c34] px-3 py-2.5">
              <span className="text-lg leading-none text-[#4fa3ff]">‹</span>
              <div className="relative flex items-center gap-2 rounded-md px-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#0d6e5f] to-[#00a884]">
                  🍻
                </div>
                <div>
                  <p className="text-[14px] font-semibold leading-tight text-white">
                    Los Panas 🇵🇦
                  </p>
                  <p className="text-[11px] text-[#8696a0]">12 miembros</p>
                </div>
                <Pulso />
              </div>
            </div>
            <div className="space-y-2 px-3 py-4">
              {[
                ["w-40", "bg-[#202c33]"],
                ["w-52", "bg-[#202c33]"],
                ["w-36 ml-auto", "bg-[#005c4b]"],
                ["w-44", "bg-[#202c33]"],
                ["w-28 ml-auto", "bg-[#005c4b]"],
              ].map(([w, bg], i) => (
                <div key={i} className={`h-7 rounded-lg ${w} ${bg}`} />
              ))}
            </div>
          </div>
        )}

        {(escena === 1 || escena === 2) && (
          <div className="relative">
            <div className="flex flex-col items-center bg-[#0b141a] px-3 pb-2 pt-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-[#0d6e5f] to-[#00a884] text-2xl">
                🍻
              </div>
              <p className="mt-2 text-[15px] font-bold text-white">
                Los Panas 🇵🇦
              </p>
              <p className="text-[11px] text-[#25d366]">Grupo · 12 miembros</p>
            </div>
            <div className="space-y-px px-3 py-3">
              {[
                "Archivos, enlaces y docs",
                "Destacados",
                "Tema del chat",
                "Exportar chat",
                "Vaciar chat",
              ].map((fila) => (
                <div
                  key={fila}
                  className={`relative flex items-center justify-between rounded-md px-3 py-2.5 text-[13px] ${
                    fila === "Exportar chat"
                      ? "bg-[#202c33] text-white"
                      : "bg-[#111b21] text-[#c6cdd1]"
                  }`}
                >
                  {fila}
                  <span className="text-[#8696a0]">›</span>
                  {fila === "Exportar chat" && escena === 1 && <Pulso />}
                </div>
              ))}
            </div>
            {escena === 2 && (
              <div className="absolute inset-0 flex items-end bg-black/60 p-3">
                <div className="w-full overflow-hidden rounded-xl bg-[#1f2c34]">
                  <p className="px-4 pb-2 pt-3 text-center text-[11px] text-[#8696a0]">
                    ¿Incluir archivos y fotos?
                  </p>
                  <div className="relative border-t border-black/40 px-4 py-3 text-center text-[14px] font-semibold text-white">
                    Sin archivos
                    <Pulso />
                  </div>
                  <div className="border-t border-black/40 px-4 py-3 text-center text-[14px] text-[#4fa3ff]">
                    Adjuntar archivos
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {escena === 3 && (
          <div className="flex h-64 flex-col items-center justify-center gap-4 px-6">
            <p className="text-[14px] font-semibold text-white">
              Exportando chat…
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#202c33]">
              <div className="h-full w-3/4 rounded-full bg-[#25d366]" />
            </div>
            <div className="mt-2 w-full rounded-xl bg-[#1f2c34] px-4 py-3 text-center text-[13px] font-medium text-white">
              📄 Los Panas.txt → Guardar en Archivos
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {PASOS_TUTORIAL.map((_, i) => (
          <button
            key={i}
            aria-label={`Paso ${i + 1}`}
            onClick={() => setEscena(i)}
            className={`h-2 rounded-full transition-all ${
              escena === i ? "w-6 bg-accent" : "w-2 bg-line"
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-sm font-medium">
        {PASOS_TUTORIAL[escena]}
      </p>
    </div>
  );
}
