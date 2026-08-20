// Helpers para el formato v3: el reporte es MARKDOWN LIBRE (como escribe
// Brandon). Contrato de salida del modelo:
//   línea 1: "# Título"
//   línea 2: "*gancho de una frase*"
//   resto:   el documento (## secciones, > citas, **negritas**)

export function tituloDeMd(md: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  return (m?.[1] ?? "El reporte de Beto").trim();
}

export function ganchoDeMd(md: string): string {
  const m = md.match(/^\*([^*\n]{10,400})\*\s*$/m);
  return (m?.[1] ?? "").trim();
}

// El cuerpo sin el H1 ni la línea del gancho (la página los renderiza aparte).
export function cuerpoDeMd(md: string): string {
  return md
    .replace(/^#\s+.+$/m, "")
    .replace(/^\*[^*\n]{10,400}\*\s*$/m, "")
    .trim();
}

// La apertura: todo lo que va antes de la primera sección "## ".
export function aperturaDeMd(md: string): string {
  const cuerpo = cuerpoDeMd(md);
  const idx = cuerpo.search(/^##\s/m);
  return (idx === -1 ? cuerpo : cuerpo.slice(0, idx)).trim();
}

// Títulos de las secciones (## …), para el teaser del paywall.
export function seccionesDeMd(md: string): string[] {
  return [...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
}
