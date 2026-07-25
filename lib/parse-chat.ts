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

// Tope del texto que se manda a la IA. Más alto = más contexto pero más
// lento; ~130k caracteres genera de forma confiable sin timeout.
const MAX_CHARS = 130_000;

function alSalto(texto: string, idx: number): number {
  const salto = texto.indexOf("\n", idx);
  return salto === -1 ? idx : salto + 1;
}

// Anti recency-bias: si el chat no cabe completo, se muestrea el inicio,
// el medio y el final en vez de quedarse solo con lo más reciente.
// Se ejecuta en el navegador para que el envío nunca pese demasiado.
export function muestrearChat(chat: string, max: number = MAX_CHARS): string {
  if (chat.length <= max) return chat;
  const tercio = Math.floor(max / 3);
  const inicio = chat.slice(0, alSalto(chat, tercio));
  const desdeMedio = alSalto(chat, Math.floor(chat.length / 2));
  const medio = chat.slice(desdeMedio, alSalto(chat, desdeMedio + tercio));
  const fin = chat.slice(alSalto(chat, chat.length - tercio));
  const corte =
    "\n\n[NOTA: aquí se omitió un tramo del chat por longitud — considera igual las tres épocas]\n\n";
  return inicio + corte + medio + corte + fin;
}

export function nombreGrupoDesdeArchivo(nombre: string): string {
  return nombre
    .replace(/\.txt$/i, "")
    .replace(/^Chat de WhatsApp con /i, "")
    .replace(/^WhatsApp Chat (with|-) /i, "")
    .replace(/^_?chat$/i, "")
    .trim();
}
