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
  reporte: Reporte;
};
