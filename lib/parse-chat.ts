export type Participante = { nombre: string; mensajes: number };

// Formato WhatsApp: "25/7/26, 9:14 a.m. - Nombre: mensaje" o "[25/7/26, 9:14:02] Nombre: mensaje"
const RE_MENSAJE =
  /^‎?\[?\s?\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?(?:\s?[ap]\.?\s?m\.?)?\]?\s*[-–]?\s*([^:]{1,40}):\s/i;

const RE_SISTEMA =
  /cifrad|encrypt|creó el grupo|añadió|añadiste|salió del grupo|eliminó|cambió|se unió|left|added|created|changed|joined|removed/i;

export function analizarChat(texto: string): {
  participantes: Participante[];
  total: number;
} {
  const conteo = new Map<string, number>();
  let total = 0;
  for (const linea of texto.split("\n")) {
    const m = linea.match(RE_MENSAJE);
    if (!m || RE_SISTEMA.test(linea)) continue;
    const nombre = m[1].trim();
    if (!nombre) continue;
    conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1);
    total++;
  }
  const participantes = [...conteo.entries()]
    .map(([nombre, mensajes]) => ({ nombre, mensajes }))
    .sort((a, b) => b.mensajes - a.mensajes)
    .slice(0, 20);
  return { participantes, total };
}

export function nombreGrupoDesdeArchivo(nombre: string): string {
  return nombre
    .replace(/\.txt$/i, "")
    .replace(/^Chat de WhatsApp con /i, "")
    .replace(/^WhatsApp Chat (with|-) /i, "")
    .replace(/^_?chat$/i, "")
    .trim();
}
