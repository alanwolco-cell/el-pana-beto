import { z } from "zod";

export const reporteSchema = z.object({
  titulo: z
    .string()
    .describe("Título del reporte, con gancho, mencionando el nombre del grupo"),
  veredicto: z
    .string()
    .describe(
      "Párrafo de apertura de Beto: su impresión general del grupo, directa y con humor",
    ),
  temas: z
    .array(
      z.object({
        titulo: z.string(),
        descripcion: z.string(),
      }),
    )
    .describe("Los 2-4 temas recurrentes u obsesiones del grupo"),
  perfiles: z
    .array(
      z.object({
        nombre: z.string(),
        apodo: z.string().describe("Apodo que Beto le pone según su comportamiento"),
        descripcion: z.string().describe("Retrato del integrante: su rol y patrones en el chat"),
      }),
    )
    .describe("Un perfil por cada integrante activo del chat"),
  premios: z.array(
    z.object({
      premio: z.string(),
      ganador: z.string(),
      motivo: z.string(),
    }),
  ),
  aura: z
    .array(
      z.object({
        nombre: z.string(),
        puntos: z.number().describe("Puntos de aura, puede ser negativo (ej. 4500 o -200)"),
        motivo: z.string().describe("Por qué, basado en un momento real del chat"),
      }),
    )
    .describe("Ranking de aura de los integrantes, de mayor a menor"),
  peleas: z
    .array(
      z.object({
        nombre: z.string(),
        motivo: z.string().describe("Por qué ganaría o perdería, con humor y basado en el chat"),
      }),
    )
    .describe("Ranking de quién ganaría una pelea, del más peligroso al que cae de primero. Puro humor."),
  listas: z
    .array(
      z.object({
        titulo: z.string().describe("Título gancho de la lista, ej: 'Los 3 que nunca leen el chat' o 'Ranking de quién llega tarde'"),
        items: z.array(z.string()).describe("Los puestos de la lista, en orden, cada uno con nombre y un detalle real que dé risa o intriga"),
      }),
    )
    .describe("2-3 listas tipo ranking que creen intriga y den ganas de discutir en el grupo (ej: quién es más tóxico, quién paga siempre, quién desaparece). Originales según lo que pasa en el chat."),
  vocabulario: z
    .array(
      z.object({
        termino: z.string(),
        definicion: z.string(),
      }),
    )
    .describe("Jerga y palabras internas del grupo, explicadas"),
  banderasVerdes: z.array(z.string()),
  banderasRojas: z.array(z.string()),
  frases: z.array(
    z.object({
      frase: z.string(),
      autor: z.string(),
      contexto: z.string(),
    }),
  ),
  predicciones: z
    .array(
      z.object({
        nombre: z.string(),
        reaccion: z.string(),
      }),
    )
    .describe("Cómo va a reaccionar cada integrante al leer este reporte"),
});

export type Reporte = z.infer<typeof reporteSchema>;

export type ReporteGuardado = {
  id: string;
  grupo: string;
  tipo: "clasico" | "profundo";
  creado: string;
  mensajes?: number;
  fotoUrl?: string;
  reporte: Reporte;
};
