import Image from "next/image";

export type Burbuja = {
  de?: string;
  colorDe?: string;
  texto: string;
  hora?: string;
  propia?: boolean;
};

export function ChatWhatsApp({
  titulo,
  subtitulo,
  mensajes,
}: {
  titulo: string;
  subtitulo: string;
  mensajes: Burbuja[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#efe7db] shadow-sm">
      <div className="flex items-center gap-3 border-b border-line bg-card px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00a884] text-sm font-semibold text-white">
          {titulo.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 1) || "G"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{titulo}</p>
          <p className="truncate text-xs text-muted">{subtitulo}</p>
        </div>
      </div>
      <div className="space-y-1.5 px-3 py-4">
        {mensajes.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.propia ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-1.5 text-sm shadow-sm ${
                m.propia ? "bg-[#d9fdd3]" : "bg-white"
              }`}
            >
              {m.de && !m.propia && (
                <p
                  className={`text-xs font-semibold ${m.colorDe ?? "text-[#e17076]"}`}
                >
                  {m.de}
                </p>
              )}
              <p className="leading-snug text-[#111b21]">{m.texto}</p>
              {m.hora && (
                <p className="mt-0.5 text-right text-[10px] text-[#667781]">
                  {m.hora}
                </p>
              )}
            </div>
          </div>
        ))}
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
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="border-b border-line bg-[#f7f7f8] px-4 py-3 text-center">
        <p className="text-sm font-semibold text-[#111]">{titulo}</p>
      </div>
      <div className="space-y-1.5 px-3 py-4">
        {mensajes.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.propia ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[85%]">
              {m.de && !m.propia && (
                <p className="mb-0.5 ml-3 text-[10px] text-[#8e8e93]">{m.de}</p>
              )}
              <div
                className={`rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                  m.propia
                    ? "bg-[#0a84ff] text-white"
                    : "bg-[#e9e9eb] text-[#111]"
                }`}
              >
                {m.texto}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VeredictoBeto({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-3">
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
