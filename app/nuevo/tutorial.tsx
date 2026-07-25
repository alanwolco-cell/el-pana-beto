"use client";

const PASOS = [
  {
    n: "1",
    titulo: "Abre el chat",
    detalle: "Entra al grupo y toca su nombre arriba.",
  },
  {
    n: "2",
    titulo: "Los tres puntitos",
    detalle: "Toca ⋯ (arriba a la derecha) → «Exportar chat».",
  },
  {
    n: "3",
    titulo: "«Sin archivos»",
    detalle: "Cuando pregunte, elige Sin archivos.",
  },
  {
    n: "4",
    titulo: "Súbelo aquí",
    detalle: "Guarda el .txt y súbelo abajo. Listo.",
  },
];

export function TutorialExportar() {
  return (
    <div className="mt-6 rounded-xl border border-line bg-card p-5">
      <p className="text-sm font-medium">
        Cómo exportar tu chat de WhatsApp — solo una vez:
      </p>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2">
        {PASOS.map((p) => (
          <li
            key={p.n}
            className="flex items-start gap-3 rounded-lg border border-line bg-paper p-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-paper">
              {p.n}
            </span>
            <span>
              <span className="block text-sm font-semibold">{p.titulo}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                {p.detalle}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-muted">
        💡 En iPhone: Ajustes del chat → baja hasta «Exportar chat». En Android:
        el menú de los ⋮ → «Más» → «Exportar chat».
      </p>
    </div>
  );
}
