import { z } from "zod";

export const reporteSchema = z.object({
  titulo: z
    .string()
    .max(220)
    .describe("Título del reporte, con gancho, mencionando el nombre del grupo"),
  gancho: z
    .string()
    .max(320)
    .describe(
      "UNA sola frase, la MÁS intrigante y jugosa de todo el reporte — la que daría más ganas de abrir el link si sale en el preview de WhatsApp. Un teaser irresistible, sin spoilear del todo. Ej: 'Alguien lleva 11 meses debiendo $40 y todavía pide fiado' o 'El ranking de aura tiene un ganador que nadie esperaba'. Que dé morbo de leer el resto.",
    ),
  veredicto: z
    .string()
    .max(1600)
    .describe(
      "Párrafo de apertura de Beto: su impresión general del grupo, directa y con humor. Máximo 4 frases.",
    ),
  temas: z
    .array(
      z.object({
        titulo: z.string().max(120),
        descripcion: z.string().max(800),
      }),
    )
    .max(3)
    .describe("Los 2-3 temas recurrentes u obsesiones del grupo"),
  perfiles: z
    .array(
      z.object({
        nombre: z.string().max(60),
        apodo: z.string().max(120).describe("Apodo que Beto le pone según su comportamiento"),
        descripcion: z.string().max(800).describe("Retrato del integrante: su rol y patrones en el chat. Máximo 3 frases."),
      }),
    )
    .max(8)
    .describe(
      "Perfiles SOLO de los integrantes con material jugoso (máximo 8). El resto se menciona en aura/premios/listas.",
    ),
  premios: z
    .array(
      z.object({
        premio: z.string().max(120),
        ganador: z.string().max(60),
        motivo: z.string().max(650),
      }),
    )
    .max(6),
  aura: z
    .array(
      z.object({
        nombre: z.string().max(60),
        puntos: z.number().describe("Puntos de aura, puede ser negativo (ej. 4500 o -200)"),
        motivo: z.string().max(650).describe("Por qué, basado en un momento real del chat"),
      }),
    )
    .max(15)
    .describe("Ranking de aura de los integrantes, de mayor a menor"),
  peleas: z
    .array(
      z.object({
        nombre: z.string().max(60),
        motivo: z.string().max(550).describe("Por qué ganaría o perdería, con humor y basado en el chat"),
      }),
    )
    .max(8)
    .describe("Ranking de quién ganaría una pelea, del más peligroso al que cae de primero. Puro humor. Solo los puestos con chiste real."),
  listas: z
    .array(
      z.object({
        titulo: z.string().max(120).describe("Título gancho de la lista, ej: 'Los 3 que nunca leen el chat' o 'Ranking de quién llega tarde'"),
        items: z.array(z.string().max(480)).max(6).describe("Los puestos de la lista, en orden, cada uno con nombre y un detalle real que dé risa o intriga"),
      }),
    )
    .max(3)
    .describe("2-3 listas tipo ranking que creen intriga y den ganas de discutir en el grupo (ej: quién es más tóxico, quién paga siempre, quién desaparece). Originales según lo que pasa en el chat."),
  vocabulario: z
    .array(
      z.object({
        termino: z.string().max(80),
        definicion: z.string().max(480),
      }),
    )
    .max(7)
    .describe("Jerga y palabras internas del grupo, explicadas (solo las buenas)"),
  banderasVerdes: z.array(z.string().max(480)).max(8),
  banderasRojas: z.array(z.string().max(480)).max(8),
  frases: z
    .array(
      z.object({
        frase: z.string().max(500),
        autor: z.string().max(60),
        contexto: z.string().max(480),
      }),
    )
    .max(7),
  predicciones: z
    .array(
      z.object({
        nombre: z.string().max(60),
        reaccion: z.string().max(480),
      }),
    )
    .max(6)
    .describe(
      "Cómo van a reaccionar al leer este reporte. SOLO si son buenísimas: una predicción es buenísima cuando imita la VOZ EXACTA de la persona — sus muletillas, su puntuación, su manía característica — tan bien que el grupo diga 'es literal él'. 3-6 letales o NINGUNA (array vacío). Una predicción tibia o genérica ('se va a reír') arruina el cierre.",
    ),
});

export type Reporte = z.infer<typeof reporteSchema>;

// ── FORMATO V2 (clon del formato Brandon) ──────────────────────────────────
// Documento que FLUYE como una pieza escrita: apertura → EL tema → perfiles →
// tolerados → premios → vocabulario → flags en prosa → LA línea más loca →
// predicciones → cierre. En los campos de prosa, las líneas que empiezan con
// "> " se renderizan como cita textual del chat (blockquote).

export const reporteSchemaV2 = z.object({
  titulo: z
    .string()
    .max(220)
    .describe(
      "Título con un número real del chat y el absurdo central. Ej: 'Los Panas de Kirk: 63,220 mensajes y ni un solo gol de Panamá'",
    ),
  gancho: z
    .string()
    .max(320)
    .describe(
      "UNA frase, la más intrigante del reporte, para el preview de WhatsApp. Que dé morbo de abrir sin spoilear.",
    ),
  apertura: z
    .string()
    .max(3800)
    .describe(
      "La entrada completa, multi-párrafo (separa párrafos con línea en blanco). Estructura: saludo directo al grupo con insulto cariñoso + 'Soy Beto. Me leí sus N mensajes enteros — sí, ENTEROS, incluyendo [el detalle más absurdo que encontraste]' + la SENTENCIA que define al grupo entre **negritas** + desmonta el nombre del grupo ('se hacen llamar X, pero seamos honestos: esto es [reframe]') + cierra con 'Vamos por partes.'",
    ),
  temaTitulo: z
    .string()
    .max(120)
    .optional()
    .describe("(Legado, no usar: las obsesiones van en 'secciones'.)"),
  tema: z
    .string()
    .max(3800)
    .optional()
    .describe("(Legado, no usar: las obsesiones van en 'secciones'.)"),
  secciones: z
    .array(
      z.object({
        emoji: z.string().max(8).describe("Un emoji para la sección"),
        titulo: z
          .string()
          .max(140)
          .describe(
            "Título INVENTADO a la medida de este grupo, con marca propia. Ej: 'La Religión de la Boloñesa', 'El Poder Real: quién manda y en qué', 'El tema. EL tema. El único tema.', 'Mauricio: el hombre que nadie quiere y todos necesitan'",
          ),
        cuerpo: z
          .string()
          .max(3800)
          .describe(
            "Prosa con datos cuantificados, citas '> ' y reacciones secas. Párrafos separados por línea en blanco.",
          ),
      }),
    )
    .min(1)
    .max(7)
    .describe(
      "2-4 secciones DISEÑADAS para este grupo según su material — no hay lista fija. SIEMPRE una es LA obsesión central con nombre propio. Otras posibles solo si el material lo pide: el que merece sección propia, los que nadie menciona pero todos toleran, quién manda de verdad, en qué se disfrazan, la guerra civil interna… Inventa el ángulo que ESTE chat pide.",
    ),
  perfiles: z
    .array(
      z.object({
        nombre: z.string().max(60),
        apodo: z.string().max(80).optional().describe("El mote entre paréntesis, si amerita. Ej: 'Isaac Adentro'"),
        cuerpo: z
          .string()
          .max(2400)
          .describe(
            "El retrato completo en prosa: epítetos apilados ('El mártir. El pararrayos.') + 'el hombre/la mujer que [específico absurdo]' + su quote como evidencia + cierre hablándole DIRECTO con su nombre. Los principales LARGOS, los medianos más cortos — varía.",
          ),
      }),
    )
    .max(18)
    .describe("Los integrantes con material real, los más jugosos primero y más largos."),
  tolerados: z
    .array(
      z.object({
        nombre: z.string().max(60),
        cuerpo: z
          .string()
          .max(800)
          .describe("1-3 líneas crueles y cariñosas. Incluye al fantasma total y hasta al bot si hay."),
      }),
    )
    .max(12)
    .describe(
      "Los integrantes menores que no dieron para perfil, despachados corto y con cariño (el fantasma con su conteo, el bot si hay). Vacío si todos tuvieron perfil o si preferiste cubrirlos en una sección propia.",
    ),
  premios: z
    .array(
      z.object({
        premio: z.string().max(120),
        ganador: z.string().max(60),
        motivo: z.string().max(550).describe("Punchline corto. Si necesita 4 frases, no era premio."),
      }),
    )
    .max(10),
  vocabulario: z
    .array(
      z.object({
        termino: z.string().max(80),
        definicion: z.string().max(480),
      }),
    )
    .max(14)
    .describe("El vocabulario que nadie afuera entiende. Solo términos reales del grupo. Vacío si no hay buenos."),
  greenFlags: z
    .string()
    .max(2000)
    .describe(
      "PÁRRAFO en prosa (no lista): el amor real del grupo visto en hechos concretos. 'Hay amor real aquí. Cuando X…'",
    ),
  redFlags: z
    .string()
    .max(2000)
    .describe("PÁRRAFO en prosa (no lista): los patrones que de verdad preocupan, dichos con humor."),
  lineaMasLoca: z.object({
    cita: z.string().max(600).describe("LA cita textual más demencial de todo el chat, con su ortografía original."),
    autor: z.string().max(60),
    comentario: z.string().max(800).describe("Tu reacción: por qué esta línea es patrimonio del grupo."),
  }),
  predicciones: z
    .array(
      z.object({
        nombre: z.string().max(60),
        reaccion: z
          .string()
          .max(480)
          .describe("Cómo va a reaccionar A ESTE REPORTE, imitando su voz/manía exacta."),
      }),
    )
    .max(10),
  cierre: z
    .string()
    .max(1500)
    .describe(
      "El párrafo final: 'Señores, son [tres verdades duras], son [reframe]. Pero se quieren de verdad, y eso se nota en cada [detalle] y cada [detalle].' Termina FIRMANDO con una frase propia del grupo.",
    ),
});

export type ReporteV2 = z.infer<typeof reporteSchemaV2>;

export type ReporteGuardado = {
  id: string;
  grupo: string;
  tipo: "clasico" | "profundo" | "yeye";
  creado: string;
  mensajes?: number;
  nombreUsuario?: string;
  // Tipo de chat elegido en el wizard (Familia, Trabajo, Grupo de panas,
  // Pareja o crush, Mejor amig@, Otro). Se usa para adaptar el copy de venta.
  contexto?: string;
  participantes?: { nombre: string; mensajes: number }[];
  stats?: {
    porHora: number[];
    porDiaSemana: number[];
    horaPico: number;
    diaSemanaPico: number;
    diaRecord: { fecha: string; cantidad: number } | null;
    mesPico: { etiqueta: string; cantidad: number } | null;
    total: number;
  };
  fotoUrl?: string;
  // "pendiente" = job creado, esperando el pago para generar (flujo v2:
  // la IA solo escribe cuando entra la plata); "generando" = el servidor
  // está escribiendo; "error" = falló; ausente/"listo" = reporte completo.
  estado?: "pendiente" | "generando" | "listo" | "error";
  // Insumos para generar server-side (se borran al terminar, así el chat NO
  // queda guardado). Presentes solo mientras estado="generando"/"error".
  inputs?: {
    chat: string;
    idioma?: string;
    nota?: string;
    pais?: string;
    intensidad?: "suave" | "normal" | "salvaje";
    telefono?: string;
    // Notas de la fase de extracción (pipeline de 2 pasadas para chats
    // grandes). Se guardan al terminar la extracción para que un reintento
    // retome directo en la escritura sin pagar la extracción otra vez.
    notas?: string;
    // Cuántos tramos de la extracción ya están en `notas` (permite retomar
    // una extracción a mitad sin repagar los tramos hechos). Ausente con
    // notas presentes = extracción completa (docs de antes de este campo).
    notasTramos?: number;
    // Síntesis global consolidada de las notas (suma la recurrencia entre
    // tramos: las obsesiones del chat COMPLETO, no de cada pedazo). También
    // se persiste para que un reintento no la pague de nuevo. Un valor corto
    // ("(fallida: …)") marca que ya se intentó y no se reintenta.
    sintesis?: string;
  };
  // Marca de tiempo ISO de cuándo arrancó una corrida de generación; sirve
  // para no lanzar dos generaciones a la vez sobre el mismo reporte.
  procesando?: string;
  // Reintentos automáticos del SERVIDOR tras fallos (el cliente nunca ve un
  // botón de reintentar: Beto se levanta solo). Tope en generar-reporte.
  reintentos?: number;
  // Diagnóstico interno: errores de la última corrida fallida (Opus y/o
  // Sonnet). No se muestra al usuario.
  errores?: string[];
  reporte?: Reporte;
  // Formato v2 (clon Brandon con schema JSON). Legado.
  reporte2?: ReporteV2;
  // Formato v3 (actual): MARKDOWN LIBRE, como escribe Brandon. Línea 1 "# Título",
  // línea 2 "*gancho*", resto el documento. Ver lib/reporte-md.ts.
  reporteMd?: string;
};
