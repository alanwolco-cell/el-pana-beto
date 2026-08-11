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

export type StatsChat = {
  porHora: number[]; // 24
  porDiaSemana: number[]; // 7 (0 = domingo)
  horaPico: number;
  diaSemanaPico: number;
  diaRecord: { fecha: string; cantidad: number } | null;
  mesPico: { etiqueta: string; cantidad: number } | null;
  total: number;
};

const DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];
const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// Captura fecha y hora del inicio de cada línea de mensaje.
const RE_FECHAHORA =
  /^‎?\[?\s?(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})[,\s]+(\d{1,2}):(\d{2})(?::\d{2})?\s?([ap])?\.?\s?m?\.?/i;

export function nombreDia(i: number): string {
  return DIAS[i] ?? "";
}

// Analiza patrones temporales del chat COMPLETO (corre en el navegador).
export function analizarStats(texto: string): StatsChat {
  const lineas = texto.split("\n");

  // Detectar orden día/mes: si algún primer número > 12, es d/m; si algún
  // segundo número > 12, es m/d. Por defecto d/m (Latinoamérica).
  let diaPrimero = true;
  for (const l of lineas) {
    const m = l.match(RE_FECHAHORA);
    if (!m) continue;
    const a = +m[1];
    const b = +m[2];
    if (a > 12) { diaPrimero = true; break; }
    if (b > 12) { diaPrimero = false; break; }
  }

  const porHora = new Array(24).fill(0);
  const porDiaSemana = new Array(7).fill(0);
  const porFecha = new Map<string, number>();
  const porMes = new Map<string, number>();
  let total = 0;

  for (const l of lineas) {
    const m = l.match(RE_FECHAHORA);
    if (!m || RE_SISTEMA.test(l)) continue;

    const n1 = +m[1];
    const n2 = +m[2];
    let anio = +m[3];
    if (anio < 100) anio += 2000;
    const dia = diaPrimero ? n1 : n2;
    const mes = (diaPrimero ? n2 : n1) - 1;
    if (mes < 0 || mes > 11 || dia < 1 || dia > 31) continue;

    let hora = +m[4];
    const ampm = (m[6] || "").toLowerCase();
    if (ampm === "p" && hora < 12) hora += 12;
    if (ampm === "a" && hora === 12) hora = 0;
    if (hora < 0 || hora > 23) continue;

    const fecha = new Date(anio, mes, dia);
    if (isNaN(fecha.getTime())) continue;

    porHora[hora]++;
    porDiaSemana[fecha.getDay()]++;
    const claveFecha = `${dia}/${mes + 1}/${anio}`;
    porFecha.set(claveFecha, (porFecha.get(claveFecha) ?? 0) + 1);
    const claveMes = `${MESES[mes]} ${anio}`;
    porMes.set(claveMes, (porMes.get(claveMes) ?? 0) + 1);
    total++;
  }

  const horaPico = porHora.indexOf(Math.max(...porHora));
  const diaSemanaPico = porDiaSemana.indexOf(Math.max(...porDiaSemana));

  let diaRecord: StatsChat["diaRecord"] = null;
  for (const [fecha, cantidad] of porFecha) {
    if (!diaRecord || cantidad > diaRecord.cantidad)
      diaRecord = { fecha, cantidad };
  }
  let mesPico: StatsChat["mesPico"] = null;
  for (const [etiqueta, cantidad] of porMes) {
    if (!mesPico || cantidad > mesPico.cantidad)
      mesPico = { etiqueta, cantidad };
  }

  return {
    porHora,
    porDiaSemana,
    horaPico,
    diaSemanaPico,
    diaRecord,
    mesPico,
    total,
  };
}

// Resumen legible de las stats para pasárselo a Beto en el prompt.
export function resumenStats(s: StatsChat): string {
  if (s.total < 20) return "";
  const h = (n: number) => {
    const ap = n < 12 ? "a.m." : "p.m.";
    const h12 = n % 12 === 0 ? 12 : n % 12;
    return `${h12} ${ap}`;
  };
  const partes = [
    `Hora en que el grupo más escribe: ${h(s.horaPico)}.`,
    `Día de la semana más activo: ${DIAS[s.diaSemanaPico]}.`,
  ];
  if (s.mesPico) partes.push(`Mes más caliente: ${s.mesPico.etiqueta} (${s.mesPico.cantidad} mensajes).`);
  if (s.diaRecord) partes.push(`Día récord: ${s.diaRecord.fecha} con ${s.diaRecord.cantidad} mensajes en un solo día.`);
  return partes.join(" ");
}

// Tope del texto que se manda a la IA. Más alto = más contexto pero más
// lento; ~130k caracteres genera de forma confiable sin timeout.
const MAX_CHARS = 130_000;

function alSalto(texto: string, idx: number): number {
  const salto = texto.indexOf("\n", idx);
  return salto === -1 ? idx : salto + 1;
}

// Anti recency-bias: si el chat no cabe completo, se toman MUCHAS ventanas
// delgadas repartidas de forma pareja por toda la historia (no 3 bloques
// grandes donde el final reciente pesa más). Así ninguna época domina.
// Se ejecuta en el navegador para que el envío nunca pese demasiado.
export function muestrearChat(chat: string, max: number = MAX_CHARS): string {
  if (chat.length <= max) return chat;

  const VENTANAS = 12; // más ventanas = cobertura temporal más pareja
  const tam = Math.floor(max / VENTANAS);
  const paso = chat.length / VENTANAS;
  const corte =
    "\n\n[…tramo omitido por longitud; todas las épocas del chat cuentan igual…]\n\n";

  const partes: string[] = [];
  for (let i = 0; i < VENTANAS; i++) {
    const desde = alSalto(chat, Math.floor(i * paso));
    partes.push(chat.slice(desde, alSalto(chat, desde + tam)));
  }
  return partes.join(corte);
}

// Limpia el nombre del export de WhatsApp para dejar SOLO el nombre del grupo:
// "Chat de WhatsApp con Los Panas (1).zip" → "Los Panas".
export function nombreGrupoDesdeArchivo(nombre: string): string {
  const limpio = nombre
    .replace(/\.(zip|txt)$/i, "")
    .replace(/\s*\(\d+\)$/, "") // "(1)", "(2)" de descargas repetidas
    .replace(/^Chat de WhatsApp (con|de|-)\s*/i, "")
    .replace(/^WhatsApp Chat (with|-|de|con)\s*/i, "")
    .replace(/^Chat WhatsApp (con|de|-)\s*/i, "")
    .replace(/_chat$/i, "")
    .replace(/^_?chat$/i, "")
    .trim();
  // Si solo quedó basura genérica, mejor nada (que el usuario escriba).
  if (/^(whatsapp|chat|export|archivo)?$/i.test(limpio)) return "";
  return limpio;
}
