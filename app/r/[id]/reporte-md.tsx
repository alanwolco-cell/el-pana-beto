import Markdown from "react-markdown";
import { cuerpoDeMd } from "@/lib/reporte-md";
import { Burbuja } from "./reporte-v2";

// Render del formato v3: markdown libre con la estética del sitio y las citas
// del chat como burbujas verdes estilo WhatsApp.
export function ReporteMd({ md }: { md: string }) {
  return (
    <div className="mt-10">
      <Markdown
        components={{
          h1: () => null, // el título lo renderiza la página
          h2: ({ children }) => (
            <h2 className="font-display mt-14 text-2xl font-semibold leading-snug tracking-tight sm:text-[1.75rem]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display mt-8 text-xl font-semibold">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mt-4 text-[1.05rem] leading-8 text-ink-soft">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          blockquote: ({ children }) => (
            // Cita textual del chat → burbuja de WhatsApp.
            <div className="my-4 flex">
              <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-[#d9fdd3] px-4 py-2.5 shadow-card [&_p]:m-0 [&_p]:text-[0.95rem] [&_p]:leading-relaxed [&_p]:text-[#111b21]">
                {children}
              </div>
            </div>
          ),
          ul: ({ children }) => (
            <ul className="mt-4 space-y-2.5 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-4 list-decimal space-y-2.5 pl-6">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex gap-2.5 leading-relaxed text-ink-soft">
              <span aria-hidden className="mt-0.5 shrink-0 text-accent">
                ·
              </span>
              <span>{children}</span>
            </li>
          ),
          hr: () => <hr className="my-10 border-line" />,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {cuerpoDeMd(md)}
      </Markdown>
    </div>
  );
}
