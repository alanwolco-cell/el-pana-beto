import Image from "next/image";

function Checks() {
  return (
    <svg viewBox="0 0 16 11" className="ml-1 inline h-[11px] w-4 fill-[#53bdeb]">
      <path d="M11.07.65a.5.5 0 0 0-.7.08L5.7 6.6 3.65 4.7a.5.5 0 0 0-.68.73l2.44 2.28a.5.5 0 0 0 .73-.06L11.15 1.35a.5.5 0 0 0-.08-.7z" />
      <path d="M15.07.65a.5.5 0 0 0-.7.08L9.7 6.6l-.55-.5-.63.8.87.8a.5.5 0 0 0 .73-.05L15.15 1.35a.5.5 0 0 0-.08-.7z" />
    </svg>
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
  mensajes,
}: {
  titulo: string;
  miembros: string;
  avatar?: string;
  mensajes: BurbujaDark[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-black/50 bg-[#0b141a] text-left shadow-xl">
      <div className="flex items-center gap-2.5 bg-[#1f2c34] px-3 py-2.5">
        <span className="text-lg leading-none text-[#4fa3ff]">‹</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#0d6e5f] to-[#00a884] text-base">
          {avatar ?? (
            <span className="text-sm font-semibold text-white">
              {titulo.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 1) || "G"}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold leading-tight text-white">
            {titulo}
          </p>
          <p className="truncate text-[11px] leading-tight text-[#8696a0]">
            {miembros}
          </p>
        </div>
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#aebac1]">
          <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
      </div>
      <div className="space-y-2 px-3 py-4">
        {mensajes.map((m, i) => {
          if (m.fecha) {
            return (
              <div key={i} className="flex justify-center py-1">
                <span className="rounded-md bg-[#1f2c34] px-2.5 py-1 text-[11px] font-medium uppercase text-[#8696a0]">
                  {m.fecha}
                </span>
              </div>
            );
          }
          return (
            <div key={i}>
              <div
                className={`flex items-end gap-1.5 ${m.propia ? "justify-end" : "justify-start"}`}
              >
                {!m.propia &&
                  (m.avatar ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2a3942] text-[13px]">
                      {m.avatar}
                    </span>
                  ) : (
                    <span className="w-6 shrink-0" />
                  ))}
                <div
                  className={`max-w-[85%] rounded-lg px-2.5 py-1.5 ${
                    m.propia ? "bg-[#005c4b]" : "bg-[#202c33]"
                  }`}
                >
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
                          El Pana Beto — El reporte del grupo
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
                  className={`-mt-1 flex ${m.propia ? "justify-end pr-2" : "justify-start pl-9"}`}
                >
                  <span className="rounded-full border border-[#0b141a] bg-[#202c33] px-1.5 py-0.5 text-[11px]">
                    {m.reaccion}
                  </span>
                </div>
              )}
            </div>
          );
        })}
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
          — Beto, después de leerlo todo
        </footer>
      </blockquote>
    </div>
  );
}
