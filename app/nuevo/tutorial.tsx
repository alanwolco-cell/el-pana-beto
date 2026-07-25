"use client";

import { useCallback, useEffect, useState } from "react";

const PASOS = [
  {
    titulo: "Toca el nombre del grupo",
    detalle: "Abre el chat y toca el nombre del grupo, arriba del todo.",
  },
  {
    titulo: "Dale a «Exportar chat»",
    detalle:
      "En la info del grupo, toca los ⋯ de arriba a la derecha y elige «Exportar chat».",
  },
  {
    titulo: "Elige «Sin archivos»",
    detalle:
      "Cuando pregunte si quieres incluir los archivos, elige «Sin archivos». Pesa menos y va más rápido.",
  },
  {
    titulo: "Sube el .txt aquí",
    detalle: "Guarda el archivo .txt en tu teléfono y súbelo aquí abajo. Listo.",
  },
];

// Marco de mini-teléfono estilo WhatsApp dark (mismos colores que chat-demo).
function Marco({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[1.4rem] border border-black/60 bg-[#0b141a] text-left shadow-xl ring-1 ring-white/5">
      {children}
    </div>
  );
}

// Resalta el elemento que hay que tocar: anillo bermellón + pulso + etiqueta.
function Resaltado({
  children,
  etiqueta,
  className = "",
  redondo = false,
  dentro = false,
}: {
  children: React.ReactNode;
  etiqueta?: string;
  className?: string;
  redondo?: boolean;
  dentro?: boolean;
}) {
  const forma = redondo ? "rounded-full" : "rounded-md";
  const borde = dentro ? "inset-0" : "-inset-1";
  const halo = dentro ? "-inset-px" : "-inset-[7px]";
  return (
    <div className={`relative ${className}`}>
      {children}
      <div
        aria-hidden
        className={`pointer-events-none absolute ${borde} border-2 border-accent ${forma}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute ${halo} animate-pulse border border-accent/50 ${forma} motion-reduce:hidden`}
      />
      {etiqueta && (
        <span className="pointer-events-none absolute -bottom-[18px] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-2 py-px text-[9px] font-semibold text-paper shadow">
          {etiqueta}
        </span>
      )}
    </div>
  );
}

function Burbujita({
  de,
  color,
  texto,
  propia,
  tenue,
}: {
  de?: string;
  color?: string;
  texto: string;
  propia?: boolean;
  tenue?: boolean;
}) {
  return (
    <div
      className={`flex ${propia ? "justify-end" : "justify-start"} ${tenue ? "opacity-40" : ""}`}
    >
      <div
        className={`max-w-[82%] rounded-lg px-2 py-1 shadow-sm ${propia ? "bg-[#005c4b]" : "bg-[#202c33]"}`}
      >
        {de && !propia && (
          <p className={`text-[9px] font-semibold leading-tight ${color ?? "text-[#e77f51]"}`}>
            {de}
          </p>
        )}
        <p className="text-[10px] leading-snug text-[#e9edef]">{texto}</p>
      </div>
    </div>
  );
}

function AvatarGrupo({ tam }: { tam: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#0d6e5f] to-[#00a884] ${tam}`}
    >
      🇵🇦
    </div>
  );
}

// Paso 1 — el chat, con el nombre del grupo resaltado.
function MockPaso1() {
  return (
    <Marco>
      <div className="flex items-center gap-1.5 bg-[#1f2c34] py-2 pl-2 pr-2.5">
        <span className="text-xl font-light leading-none text-[#4fa3ff]">‹</span>
        <AvatarGrupo tam="h-7 w-7 text-sm" />
        <Resaltado className="min-w-0 flex-1" etiqueta="toca aquí">
          <div className="min-w-0 px-1 py-0.5">
            <p className="truncate text-[11px] font-semibold leading-tight text-white">
              Los Panas 🇵🇦
            </p>
            <p className="truncate text-[9px] leading-tight text-[#8696a0]">
              tú, Chichi, Mari, Yeyo…
            </p>
          </div>
        </Resaltado>
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-[#aebac1]">
          <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden px-2 pt-3">
        <div className="flex justify-center pb-1">
          <span className="rounded-md bg-[#1d282f] px-2 py-0.5 text-[8px] font-medium uppercase tracking-wide text-[#8696a0]">
            Hoy
          </span>
        </div>
        <Burbujita de="Chichi" color="text-[#e77f51]" texto="viste lo del viernes? 💀" />
        <Burbujita propia texto="jajaja no me hables de eso" />
        <Burbujita de="Mari" color="text-[#a791f5]" texto="aquí nadie borra nada 😂" />
        <Burbujita de="Yeyo" color="text-[#53bdeb]" texto="qué xopa, quién manda el reporte" />
      </div>
      <div className="flex items-center gap-1.5 bg-[#1f2c34] px-2 py-1.5">
        <span className="text-lg font-light leading-none text-[#8696a0]">＋</span>
        <div className="flex-1 rounded-full bg-[#2a3942] px-3 py-1 text-[10px] text-[#8696a0]">
          Mensaje
        </div>
      </div>
    </Marco>
  );
}

// Paso 2 — info del grupo, con el menú ⋯ abierto y «Exportar chat» resaltado.
function MockPaso2() {
  return (
    <Marco>
      <div className="relative flex-1">
        <div className="flex items-center justify-between bg-[#1f2c34] px-2.5 py-2">
          <span className="text-xl font-light leading-none text-[#4fa3ff]">‹</span>
          <Resaltado redondo>
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold tracking-widest text-[#aebac1]">
              ⋯
            </span>
          </Resaltado>
        </div>
        <div className="flex flex-col items-center px-3 pt-4">
          <AvatarGrupo tam="h-14 w-14 text-3xl" />
          <p className="mt-2 text-[13px] font-semibold text-white">Los Panas 🇵🇦</p>
          <p className="text-[9px] text-[#8696a0]">Grupo · 12 miembros</p>
          <div className="mt-4 w-full space-y-px overflow-hidden rounded-lg">
            <div className="bg-[#111b21] px-2.5 py-2 text-[9px] text-[#e9edef]">
              Notificaciones
            </div>
            <div className="bg-[#111b21] px-2.5 py-2 text-[9px] text-[#e9edef]">
              Archivos, enlaces y docs
            </div>
            <div className="bg-[#111b21] px-2.5 py-2 text-[9px] text-[#e9edef]">
              Encriptación
            </div>
          </div>
        </div>
        <div className="absolute right-1.5 top-10 w-[124px] rounded-lg bg-[#233138] py-1 shadow-2xl ring-1 ring-black/40">
          <p className="px-2.5 py-1.5 text-[9px] text-[#d1d7db]">Cambiar fondo</p>
          <p className="px-2.5 py-1.5 text-[9px] text-[#d1d7db]">Vaciar chat</p>
          <Resaltado className="mx-1 mt-0.5" dentro etiqueta="toca aquí">
            <p className="rounded-md bg-accent/20 px-1.5 py-1.5 text-[9px] font-semibold text-white">
              Exportar chat
            </p>
          </Resaltado>
        </div>
      </div>
    </Marco>
  );
}

// Paso 3 — hoja de acción con «Sin archivos» resaltado.
function MockPaso3() {
  return (
    <Marco>
      <div className="relative flex-1 overflow-hidden">
        <div className="space-y-1.5 px-2 pt-3">
          <Burbujita tenue de="Chichi" texto="viste lo del viernes? 💀" />
          <Burbujita tenue propia texto="jajaja no me hables de eso" />
          <Burbujita tenue de="Mari" texto="aquí nadie borra nada 😂" />
        </div>
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-x-2 bottom-2 space-y-1.5">
          <div className="overflow-hidden rounded-xl bg-[#1f2c34]/95 text-center backdrop-blur">
            <p className="border-b border-white/10 px-3 py-2 text-[9px] leading-snug text-[#8696a0]">
              ¿Deseas incluir los archivos de este chat?
            </p>
            <Resaltado dentro etiqueta="elige esta">
              <p className="border-b border-white/10 py-2 text-[11px] font-semibold text-[#53bdeb]">
                Sin archivos
              </p>
            </Resaltado>
            <p className="py-2 text-[11px] text-[#53bdeb]/70">Incluir archivos</p>
          </div>
          <div className="rounded-xl bg-[#1f2c34]/95 py-2 text-center text-[11px] font-semibold text-[#53bdeb]">
            Cancelar
          </div>
        </div>
      </div>
    </Marco>
  );
}

// Paso 4 — el .txt guardado y la zona de subida del sitio.
function MockPaso4() {
  return (
    <Marco>
      <div className="flex items-center gap-1.5 bg-[#1f2c34] px-2.5 py-2">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#00a884]">
          <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        </svg>
        <p className="text-[10px] font-semibold text-white">Chat exportado</p>
      </div>
      <div className="px-2.5 py-2.5">
        <div className="flex items-center gap-2 rounded-lg bg-[#202c33] p-2">
          <div className="flex h-9 w-7 shrink-0 items-center justify-center rounded-sm bg-[#2a3942] text-[8px] font-bold text-[#53bdeb] ring-1 ring-white/10">
            TXT
          </div>
          <div className="min-w-0">
            <p className="truncate text-[9px] font-medium text-[#e9edef]">
              Chat de WhatsApp con Los Panas 🇵🇦.txt
            </p>
            <p className="text-[8px] text-[#8696a0]">128 KB · Documento de texto</p>
          </div>
        </div>
        <p className="mt-2 text-center text-sm text-[#8696a0]">↓</p>
      </div>
      <div className="mt-auto border-t border-line bg-paper px-2.5 pb-3 pt-2.5">
        <p className="pb-1.5 text-center text-[8px] font-semibold uppercase tracking-widest text-muted">
          elpanabeto.com
        </p>
        <Resaltado dentro>
          <div className="rounded-lg border-2 border-dashed border-accent/70 bg-card px-2 py-3.5 text-center">
            <p className="text-[11px] font-semibold text-accent">⬆ Sube tu .txt aquí</p>
            <p className="mt-0.5 text-[8px] text-muted">y Beto hace el resto</p>
          </div>
        </Resaltado>
      </div>
    </Marco>
  );
}

const MOCKUPS = [MockPaso1, MockPaso2, MockPaso3, MockPaso4];

export function TutorialExportar() {
  const [activo, setActivo] = useState(0);
  const [auto, setAuto] = useState(true);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (!auto || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setActivo((a) => (a + 1) % PASOS.length),
      4500,
    );
    return () => clearInterval(id);
  }, [auto, pausado]);

  const elegir = useCallback((i: number) => {
    setAuto(false);
    setActivo(((i % PASOS.length) + PASOS.length) % PASOS.length);
  }, []);

  return (
    <div
      className="mt-6 overflow-hidden rounded-xl border border-line bg-card"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="border-b border-line px-5 py-4">
        <p className="text-sm font-semibold">Cómo exportar tu chat de WhatsApp</p>
        <p className="mt-0.5 text-xs text-muted">
          Toma un minuto y solo se hace una vez.
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[1fr_236px] sm:items-center sm:gap-6">
        {/* Lista de pasos — desktop */}
        <div className="hidden sm:flex sm:flex-col sm:gap-1.5">
          {PASOS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => elegir(i)}
              aria-current={i === activo ? "step" : undefined}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                i === activo
                  ? "border-accent/40 bg-paper shadow-sm"
                  : "border-transparent hover:bg-paper/70"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                  i === activo
                    ? "bg-accent text-paper"
                    : "bg-line text-muted"
                }`}
              >
                {i + 1}
              </span>
              <span>
                <span
                  className={`block text-sm font-semibold ${i === activo ? "" : "text-muted"}`}
                >
                  {p.titulo}
                </span>
                <span
                  className={`mt-0.5 block text-xs leading-relaxed ${
                    i === activo ? "text-muted" : "text-muted/70"
                  }`}
                >
                  {p.detalle}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Controles — móvil */}
        <div className="flex items-center justify-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => elegir(activo - 1)}
            aria-label="Paso anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-lg text-muted"
          >
            ‹
          </button>
          {PASOS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => elegir(i)}
              aria-label={`Paso ${i + 1}`}
              aria-current={i === activo ? "step" : undefined}
              className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                i === activo
                  ? "bg-accent text-paper"
                  : "border border-line bg-paper text-muted"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => elegir(activo + 1)}
            aria-label="Paso siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-lg text-muted"
          >
            ›
          </button>
        </div>

        {/* Mini-teléfono */}
        <div className="relative mx-auto h-[330px] w-[220px]">
          {MOCKUPS.map((Mock, i) => (
            <div
              key={i}
              aria-hidden={i !== activo}
              className={`absolute inset-0 transition-all duration-300 motion-reduce:transition-none ${
                i === activo
                  ? "opacity-100"
                  : "pointer-events-none scale-[0.97] opacity-0"
              }`}
            >
              <Mock />
            </div>
          ))}
        </div>

        {/* Texto del paso activo — móvil */}
        <div className="text-center sm:hidden">
          <p className="text-sm font-semibold">
            {activo + 1}. {PASOS[activo].titulo}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {PASOS[activo].detalle}
          </p>
        </div>
      </div>

      <p className="border-t border-line bg-paper/60 px-5 py-3 text-xs text-muted">
        📱 En Android es casi igual: el menú ⋮ → «Más» → «Exportar chat».
      </p>
    </div>
  );
}
