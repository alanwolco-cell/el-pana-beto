import Image from "next/image";

function Checks() {
  return (
    <svg viewBox="0 0 16 11" className="ml-1 inline h-[11px] w-[15px] fill-[#53bdeb] align-middle">
      <path d="M11.07.65a.5.5 0 0 0-.7.08L5.7 6.6 3.65 4.7a.5.5 0 0 0-.68.73l2.44 2.28a.5.5 0 0 0 .73-.06L11.15 1.35a.5.5 0 0 0-.08-.7z" />
      <path d="M15.07.65a.5.5 0 0 0-.7.08L9.7 6.6l-.55-.5-.63.8.87.8a.5.5 0 0 0 .73-.05L15.15 1.35a.5.5 0 0 0-.08-.7z" />
    </svg>
  );
}

// Patrón de doodles de WhatsApp (dark): SVG embebido, sutil.
const DOODLE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.03' stroke-width='1.4'%3E%3Ccircle cx='22' cy='24' r='7'/%3E%3Cpath d='M52 18h14v12H52z'/%3E%3Cpath d='M96 14l6 10-12 0z'/%3E%3Cpath d='M118 30c4-4 10-2 10 3'/%3E%3Cpath d='M14 60c3-5 9-5 12 0'/%3E%3Ccircle cx='60' cy='64' r='5'/%3E%3Cpath d='M92 56h16M100 56v14'/%3E%3Cpath d='M124 66l7 7-7 7'/%3E%3Cpath d='M20 98l6-6 6 6-6 6z'/%3E%3Cpath d='M54 96c0 6 5 10 11 8'/%3E%3Ccircle cx='98' cy='100' r='6'/%3E%3Cpath d='M126 104h8v10h-8z'/%3E%3Cpath d='M40 126c4-3 9-1 9 4'/%3E%3Cpath d='M74 128l5-8 5 8z'/%3E%3C/g%3E%3C/svg%3E\")";

// Barra de estado iOS: hora, señal, wifi y batería.
function StatusBariOS() {
  return (
    <div className="flex items-center justify-between bg-[#1f2c34] px-6 pb-1 pt-2 text-white">
      <span className="text-[15px] font-semibold tracking-tight">3:04</span>
      <div className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" className="h-3 w-[18px] fill-white">
          <rect x="0" y="7" width="3" height="5" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="1" width="3" height="11" rx="1" fill-opacity="0.4" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-3 w-4 fill-white">
          <path d="M8 2.5c2.2 0 4.2.9 5.7 2.3l-1.1 1.1A6.4 6.4 0 0 0 8 4.1c-1.7 0-3.3.7-4.6 1.8L2.3 4.8A8 8 0 0 1 8 2.5zm0 3.2c1.3 0 2.5.5 3.4 1.4l-1.1 1.1A3.3 3.3 0 0 0 8 7.3c-.9 0-1.7.3-2.3.9L4.6 7.1A4.8 4.8 0 0 1 8 5.7zm0 3.1c.6 0 1.1.2 1.5.6L8 10.6 6.5 9.4c.4-.4.9-.6 1.5-.6z" />
        </svg>
        <svg viewBox="0 0 26 12" className="h-3 w-[26px]">
          <rect x="0.5" y="1.5" width="21" height="9" rx="2.5" fill="none" stroke="white" stroke-opacity="0.5" />
          <rect x="2" y="3" width="17" height="6" rx="1.2" fill="white" />
          <rect x="23" y="4" width="1.6" height="4" rx="0.8" fill="white" fill-opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

export type BurbujaDark = {
  de?: string;
  colorDe?: string;
  avatar?: string;
  texto?: string;
  hora?: string;
  propia?: boolean;
  fecha?: string;
  reenviado?: boolean;
  linkCard?: boolean;
  tarjeta?: string;
  citando?: { de: string; texto: string };
  reaccion?: string;
};

export function ChatWhatsAppDark({
  titulo,
  miembros,
  avatar,
  noLeidos = "340",
  mensajes,
}: {
  titulo: string;
  miembros: string;
  avatar?: string;
  noLeidos?: string;
  mensajes: BurbujaDark[];
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/60 bg-[#0b141a] text-left shadow-2xl ring-1 ring-white/5">
      <StatusBariOS />
      <div className="flex items-center gap-2 bg-[#1f2c34] px-2.5 pb-2.5 pt-1">
        <div className="flex items-center">
          <span className="text-2xl font-light leading-none text-[#4fa3ff]">
            ‹
          </span>
          <span className="text-[13px] font-medium text-[#4fa3ff]">
            {noLeidos}
          </span>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#0d6e5f] to-[#00a884] text-lg">
          {avatar ?? (
            <span className="text-[15px] font-semibold text-white">
              {titulo.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 1) || "G"}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight text-white">
            {titulo}
          </p>
          <p className="truncate text-[11px] leading-tight text-[#8696a0]">
            {miembros}
          </p>
        </div>
        <div className="flex items-center gap-4 pl-1 pr-1 text-[#aebac1]">
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-current">
            <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-current">
            <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6a1 1 0 0 0-1 .2l-2.2 2.2a15 15 0 0 1-6.6-6.6l2.2-2.2a1 1 0 0 0 .2-1C8.7 6.4 8.5 5.2 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" />
          </svg>
        </div>
      </div>
      <div
        className="space-y-1.5 px-3 py-4"
        style={{ backgroundColor: "#0b141a", backgroundImage: DOODLE }}
      >
        {mensajes.map((m, i) => {
          if (m.fecha) {
            return (
              <div key={i} className="flex justify-center py-1.5">
                <span className="rounded-lg bg-[#1d282f] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[#8696a0] shadow-sm">
                  {m.fecha}
                </span>
              </div>
            );
          }
          const primeroDeGrupo =
            i === 0 || mensajes[i - 1]?.propia !== m.propia || !!mensajes[i - 1]?.fecha;
          return (
            <div key={i} className={primeroDeGrupo ? "pt-1.5" : ""}>
              <div
                className={`flex items-end gap-1.5 ${m.propia ? "justify-end" : "justify-start"}`}
              >
                {!m.propia &&
                  (m.avatar && primeroDeGrupo ? (
                    <span className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2a3942] text-[15px]">
                      {m.avatar}
                    </span>
                  ) : (
                    <span className="w-7 shrink-0" />
                  ))}
                <div
                  className={`relative max-w-[82%] px-2.5 py-1.5 shadow-sm ${
                    m.propia
                      ? `bg-[#005c4b] ${primeroDeGrupo ? "rounded-lg rounded-tr-sm" : "rounded-lg"}`
                      : `bg-[#202c33] ${primeroDeGrupo ? "rounded-lg rounded-tl-sm" : "rounded-lg"}`
                  }`}
                >
                  {primeroDeGrupo && (
                    <span
                      className={`absolute top-0 h-3 w-3 ${
                        m.propia
                          ? "-right-[6px] text-[#005c4b]"
                          : "-left-[6px] text-[#202c33]"
                      }`}
                      aria-hidden
                    >
                      <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current">
                        {m.propia ? (
                          <path d="M0 0h6c0 4-2 6-6 6V0z" />
                        ) : (
                          <path d="M12 0H6c0 4 2 6 6 6V0z" />
                        )}
                      </svg>
                    </span>
                  )}
                  {m.de && !m.propia && (
                    <p
                      className={`text-[12px] font-semibold leading-tight ${m.colorDe ?? "text-[#e77f51]"}`}
                    >
                      {m.de}
                    </p>
                  )}
                  {m.reenviado && (
                    <p className="mt-0.5 text-[11px] italic text-[#8696a0]">
                      ↪ Reenviado
                    </p>
                  )}
                  {m.citando && (
                    <div className="mt-1 rounded-md border-l-2 border-[#53bdeb] bg-black/25 px-2 py-1">
                      <p className="text-[11px] font-semibold text-[#53bdeb]">
                        {m.citando.de}
                      </p>
                      <p className="truncate text-[11px] text-[#8696a0]">
                        {m.citando.texto}
                      </p>
                    </div>
                  )}
                  {m.linkCard && (
                    <div className="mt-1 flex items-center gap-2 rounded-md bg-black/25 p-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold leading-snug text-white">
                          El Pana Beto · El reporte del grupo
                        </p>
                        <p className="text-[11px] text-[#8696a0]">
                          elpanabeto.com
                        </p>
                      </div>
                      <Image
                        src="/beto.jpg"
                        alt=""
                        width={44}
                        height={44}
                        className="shrink-0 rounded-md object-cover"
                      />
                    </div>
                  )}
                  {m.tarjeta && (
                    <div className="mt-1 rounded-md bg-[#f7f3ec] px-3 py-2.5">
                      <p className="text-[12.5px] leading-snug text-[#191613]">
                        {m.tarjeta}
                      </p>
                    </div>
                  )}
                  {m.texto && (
                    <p className="text-[13.5px] leading-snug text-[#e9edef]">
                      {m.texto}
                      <span className="ml-2 inline-block translate-y-0.5 whitespace-nowrap text-[10px] text-[#8696a0]">
                        {m.hora}
                        {m.propia && <Checks />}
                      </span>
                    </p>
                  )}
                  {!m.texto && (m.linkCard || m.tarjeta) && (
                    <p className="mt-0.5 text-right text-[10px] text-[#8696a0]">
                      {m.hora}
                      {m.propia && <Checks />}
                    </p>
                  )}
                </div>
              </div>
              {m.reaccion && (
                <div
                  className={`-mt-1.5 flex ${m.propia ? "justify-end pr-3" : "justify-start pl-10"}`}
                >
                  <span className="rounded-full border-2 border-[#0b141a] bg-[#2a3942] px-1.5 py-0.5 text-[11px] shadow">
                    {m.reaccion}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 bg-[#1f2c34] px-3 py-2">
        <span className="text-2xl font-light leading-none text-[#8696a0]">＋</span>
        <div className="flex-1 rounded-full bg-[#2a3942] px-4 py-2 text-[13px] text-[#8696a0]">
          Mensaje
        </div>
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#8696a0]">
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zm7 9a7 7 0 0 1-6 6.9V21h-2v-3.1A7 7 0 0 1 5 11h2a5 5 0 0 0 10 0h2z" />
        </svg>
      </div>
    </div>
  );
}

export function VeredictoBeto({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 flex items-start gap-3">
      <Image
        src="/beto.jpg"
        alt="Beto"
        width={40}
        height={40}
        className="mt-1 shrink-0 rounded-full border border-line object-cover"
      />
      <blockquote className="rounded-lg rounded-tl-none border border-line bg-card px-4 py-3 text-sm leading-relaxed">
        {children}
        <footer className="mt-1.5 text-xs font-medium text-accent">
          Beto, después de leerlo todo
        </footer>
      </blockquote>
    </div>
  );
}
