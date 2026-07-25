import Image from "next/image";

export type Burbuja = {
  de?: string;
  colorDe?: string;
  texto?: string;
  hora?: string;
  propia?: boolean;
  fecha?: string;
  entregado?: boolean;
};

function Checks() {
  return (
    <svg viewBox="0 0 16 11" className="ml-1 inline h-[11px] w-4 fill-[#53bdeb]">
      <path d="M11.07.65a.5.5 0 0 0-.7.08L5.7 6.6 3.65 4.7a.5.5 0 0 0-.68.73l2.44 2.28a.5.5 0 0 0 .73-.06L11.15 1.35a.5.5 0 0 0-.08-.7z" />
      <path d="M15.07.65a.5.5 0 0 0-.7.08L9.7 6.6l-.55-.5-.63.8.87.8a.5.5 0 0 0 .73-.05L15.15 1.35a.5.5 0 0 0-.08-.7z" />
    </svg>
  );
}

export function ChatWhatsApp({
  titulo,
  estado,
  mensajes,
}: {
  titulo: string;
  estado: string;
  mensajes: Burbuja[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-line bg-[#efeae2] shadow-lg">
      <div className="flex items-center gap-2 bg-[#008069] px-3 py-2.5 text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current opacity-90">
          <path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" />
        </svg>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6fcf97] text-sm font-semibold">
          {titulo.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 1) || "G"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium leading-tight">
            {titulo}
          </p>
          <p className="truncate text-xs leading-tight opacity-80">{estado}</p>
        </div>
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current opacity-90">
          <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current opacity-90">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z" />
        </svg>
      </div>
      <div className="space-y-1 px-3 py-3">
        {mensajes.map((m, i) =>
          m.fecha ? (
            <div key={i} className="flex justify-center py-1">
              <span className="rounded-md bg-white px-2.5 py-1 text-[11px] font-medium uppercase text-[#54656f] shadow-sm">
                {m.fecha}
              </span>
            </div>
          ) : (
            <div
              key={i}
              className={`flex ${m.propia ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[85%] rounded-lg px-2.5 py-1.5 shadow-sm ${
                  m.propia
                    ? "rounded-tr-none bg-[#d9fdd3]"
                    : "rounded-tl-none bg-white"
                }`}
              >
                {m.de && !m.propia && (
                  <p
                    className={`text-[12.5px] font-semibold leading-tight ${m.colorDe ?? "text-[#e17076]"}`}
                  >
                    {m.de}
                  </p>
                )}
                <p className="text-[14px] leading-snug text-[#111b21]">
                  {m.texto}
                  <span className="ml-2 inline-block translate-y-0.5 whitespace-nowrap text-[10px] text-[#667781]">
                    {m.hora}
                    {m.propia && <Checks />}
                  </span>
                </p>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export function ChatIMessage({
  titulo,
  mensajes,
}: {
  titulo: string;
  mensajes: Burbuja[];
}) {
  const ultimoPropio = mensajes.reduce(
    (acc, m, i) => (m.propia ? i : acc),
    -1,
  );
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-line bg-white shadow-lg">
      <div className="flex flex-col items-center border-b border-[#e5e5ea] bg-[#f7f7f8] px-4 pb-2 pt-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#a8b0bb] to-[#889099] text-base font-semibold text-white">
          {titulo.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 1) || "G"}
        </div>
        <p className="mt-1 text-[11px] font-medium text-[#111]">
          {titulo} <span className="text-[#8e8e93]">›</span>
        </p>
      </div>
      <div className="space-y-1 px-3 py-3">
        {mensajes.map((m, i) =>
          m.fecha ? (
            <p
              key={i}
              className="py-1 text-center text-[11px] font-medium text-[#8e8e93]"
            >
              {m.fecha}
            </p>
          ) : (
            <div key={i}>
              <div
                className={`flex ${m.propia ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[85%]">
                  {m.de && !m.propia && (
                    <p className="mb-0.5 ml-3 text-[10px] text-[#8e8e93]">
                      {m.de}
                    </p>
                  )}
                  <div
                    className={`rounded-[1.15rem] px-3.5 py-2 text-[14px] leading-snug ${
                      m.propia
                        ? "bg-[#0a84ff] text-white"
                        : "bg-[#e9e9eb] text-[#111]"
                    }`}
                  >
                    {m.texto}
                  </div>
                </div>
              </div>
              {i === ultimoPropio && (
                <p className="mr-1 mt-0.5 text-right text-[10px] font-medium text-[#8e8e93]">
                  Entregado
                </p>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export type BurbujaDark = {
  de?: string;
  colorDe?: string;
  texto?: string;
  hora?: string;
  propia?: boolean;
  linkCard?: boolean;
  tarjeta?: string;
  citando?: { de: string; texto: string };
  reaccion?: string;
};

export function ChatWhatsAppDark({
  titulo,
  miembros,
  mensajes,
}: {
  titulo: string;
  miembros: string;
  mensajes: BurbujaDark[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-black/50 bg-[#0b141a] text-left shadow-xl">
      <div className="flex items-center gap-2.5 bg-[#1f2c34] px-3 py-2.5">
        <span className="text-lg leading-none text-[#4fa3ff]">‹</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-sm font-semibold text-white">
          {titulo.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 1) || "G"}
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
        {mensajes.map((m, i) => (
          <div key={i}>
            <div className={`flex ${m.propia ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-lg px-2.5 py-1.5 ${
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
                      <p className="text-[11px] text-[#8696a0]">elpanabeto.com</p>
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
                className={`-mt-1 flex ${m.propia ? "justify-end pr-2" : "justify-start pl-2"}`}
              >
                <span className="rounded-full border border-[#0b141a] bg-[#202c33] px-1.5 py-0.5 text-[11px]">
                  {m.reaccion}
                </span>
              </div>
            )}
          </div>
        ))}
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
