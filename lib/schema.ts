import { z } from "zod";

export const reporteSchema = z.object({
  titulo: z
    .string()
    .max(160)
    .describe("Título del reporte, con gancho, mencionando el nombre del grupo"),
  veredicto: z
    .string()
    .max(900)
    .describe(
      "Párrafo de apertura de Beto: su impresión general del grupo, directa y con humor. Máximo 4 frases.",
    ),
  temas: z
    .array(
      z.object({
        titulo: z.string().max(120),
        descripcion: z.string().max(500),
      }),
    )
    .max(4)
    .describe("Los 2-4 temas recurrentes u obsesiones del grupo"),
  perfiles: z
    .array(
      z.object({
        nombre: z.string().max(60),
        apodo: z.string().max(80).describe("Apodo que Beto le pone según su comportamiento"),
        descripcion: z.string().max(500).describe("Retrato del integrante: su rol y patrones en el chat. Máximo 3 frases."),
      }),
    )
    .max(15)
    .describe("Un perfil por cada integrante activo del chat"),
  premios: z
    .array(
      z.object({
        premio: z.string().max(120),
        ganador: z.string().max(60),
        motivo: z.string().max(400),
      }),
    )
    .max(8),
  aura: z
    .array(
      z.object({
        nombre: z.string().max(60),
        puntos: z.number().describe("Puntos de aura, puede ser negativo (ej. 4500 o -200)"),
        motivo: z.string().max(400).describe("Por qué, basado en un momento real del chat"),
      }),
    )
    .max(15)
    .describe("Ranking de aura de los integrantes, de mayor a menor"),
  peleas: z
    .array(
      z.object({
        nombre: z.string().max(60),
        motivo: z.string().max(350).describe("Por qué ganaría o perdería, con humor y basado en el chat"),
      }),
    )
    .max(15)
    .describe("Ranking de quién ganaría una pelea, del más peligroso al que cae de primero. Puro humor."),
  listas: z
    .array(
      z.object({
        titulo: z.string().max(120).describe("Título gancho de la lista, ej: 'Los 3 que nunca leen el chat' o 'Ranking de quién llega tarde'"),
        items: z.array(z.string().max(300)).max(6).describe("Los puestos de la lista, en orden, cada uno con nombre y un detalle real que dé risa o intriga"),
      }),
    )
    .max(3)
    .describe("2-3 listas tipo ranking que creen intriga y den ganas de discutir en el grupo (ej: quién es más tóxico, quién paga siempre, quién desaparece). Originales según lo que pasa en el chat."),
  vocabulario: z
    .array(
      z.object({
        termino: z.string().max(80),
        definicion: z.string().max(300),
      }),
    )
    .max(12)
    .describe("Jerga y palabras internas del grupo, explicadas"),
  banderasVerdes: z.array(z.string().max(300)).max(8),
  banderasRojas: z.array(z.string().max(300)).max(8),
  frases: z
    .array(
      z.object({
        frase: z.string().max(300),
        autor: z.string().max(60),
        contexto: z.string().max(300),
      }),
    )
    .max(10),
  predicciones: z
    .array(
      z.object({
        nombre: z.string().max(60),
        reaccion: z.string().max(300),
      }),
    )
    .max(15)
    .describe("Cómo va a reaccionar cada integrante al leer este reporte"),
});

export type Reporte = z.infer<typeof reporteSchema>;

export type ReporteGuardado = {
  id: string;
  grupo: string;
  tipo: "clasico" | "profundo" | "yeye";
  creado: string;
  mensajes?: number;
  fotoUrl?: string;
  reporte: Reporte;
};
