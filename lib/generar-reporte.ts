import { waitUntil } from "@vercel/functions";
import { generateText } from "ai";
import { promptSistema } from "@/lib/beto";
import { incrementarContador } from "@/lib/contador";
import { estaDesbloqueado, leerPagos } from "@/lib/pagos";
import { muestrearChat, resumenStats } from "@/lib/parse-chat";
import { tituloDeMd } from "@/lib/reporte-md";
import { guardarReporte, leerReporte } from "@/lib/storage";
import { enviarReporteWhatsApp, whatsappConfigurado } from "@/lib/whatsapp";

// Ventana durante la cual se considera que una generación sigue viva, para no
// lanzar dos a la vez. Un poco mayor que el caso normal (~25-40s) para que, si
// una corrida muere (waitUntil flaky, celular en background), otra la retome
// pronto sin duplicar una que sí está corriendo.
// Mayor que el peor caso de una corrida (Opus hasta 210s + fallback Sonnet
// hasta 80s = 290s), para que un reintento no arranque una segunda generación
// encima de una que sí vive (eso duplica el costo).
const VENTANA_PROCESANDO_MS = 300_000;

export type ResultadoGeneracion =
  | "listo"
  | "generando"
  | "error"
  | "no-existe"
  // Flujo v2: el job existe pero el pago no está registrado: no se genera.
  | "pendiente";

// ── Pipeline de 2 pasadas para chats grandes ────────────────────────────────
// Por debajo del umbral, el chat entra directo a Opus (como siempre). Por
// encima, Haiku (barato) LEE EL CHAT COMPLETO por tramos en paralelo y cosecha
// el material; Opus escribe el reporte con todas las joyas + una muestra cruda
// para calibrar las voces. Costo extra solo en chats gigantes (~$0.5-0.8).
const UMBRAL_EXTRACCION = 150_000; // chars
const TAM_TRAMO = 250_000; // chars por tramo (cabe holgado en Haiku)
const LOTE_EXTRACCION = 6; // tramos en paralelo por lote

const PROMPT_EXTRACTOR = `Eres el INVESTIGADOR de un comediante que va a roastear a un grupo de WhatsApp. Tu trabajo NO es hacer chistes: es cosechar material CRUDO y FIEL de este tramo del chat. Entrega, en texto plano organizado:
1. QUOTES EXACTAS (las 15-30 más absurdas, reveladoras o graciosas del tramo), con autor y ortografía/emojis originales, formato: AUTOR: “texto”. Prioriza las que muestran personalidad. Si un mensaje contrasta ridículo con otro del mismo autor cercano en el tiempo (formal y luego una barbaridad, pide calma y luego pelea), captura AMBOS y señala el contraste.
2. POR PERSONA: sus patrones y obsesiones EN ESTE TRAMO (de qué no para de hablar, qué repite), su VOZ de escritura (mayúsculas, poético, telegrama, "jajaja" seco, audios, ortografía), y conteos si aplica.
3. TEMAS RECURRENTES del tramo y cuántas veces aparecen.
4. CANON VIVO (lo más importante): los bits/apodos/cánticos/frases-ritual MÁS REPETIDOS del tramo, RANQUEADOS por frecuencia, con conteo aproximado y fecha de última aparición. El comediante construirá el reporte sobre este ranking: no te dejes ninguno.
5. DINÁMICAS: quién le tira a quién, quién manda, quién desaparece, tensiones.
6. NÚMEROS Y RÉCORDS: deudas, conteos, fechas de promesas, encuestas y sus temas.
7. RANGO DE FECHAS del tramo y eventos época.
8. CANDIDATAS A "LÍNEA MÁS LOCA" (lo más demencial dicho en serio).
Sé denso y literal: máximo material, cero opinión, cero chistes tuyos. Todo lo que cites debe ser textual del tramo.`;

// Segunda pasada barata: las notas vienen POR TRAMO y ningún tramo sabe qué
// se repite en los demás. Sin este paso, el tema que domina el chat entero
// (aparece en 12 de 16 tramos) pesa igual que un chiste de una sola vez, y el
// escritor construye el reporte sobre material random. Aquí Haiku lee TODAS
// las notas juntas y corona las obsesiones globales por recurrencia real.
const PROMPT_CONSOLIDADOR = `Eres el EDITOR JEFE de la investigación de un comediante. Recibes las notas por tramos de un chat de WhatsApp leído al 100%. Consolídalas en UNA síntesis global fiel del chat COMPLETO. Entrega, en texto plano:
1. OBSESIONES GLOBALES (lo más importante): los 10-15 temas/bits/rituales/apodos MÁS RECURRENTES sumando TODOS los tramos. Ordena por recurrencia real a lo largo del chat entero (un tema que aparece en 12 de 16 tramos va ARRIBA de uno brillante que salió una vez). Para cada uno: en cuántos tramos aparece, conteo total aproximado, quiénes lo protagonizan, y sus 2-4 mejores quotes textuales con autor.
2. ELENCO GLOBAL: por persona, su patrón a lo largo de TODO el chat (no de un tramo), su contradicción más documentada entre tramos, y su quote más representativa.
3. LENGUAJE INTERNO: las frases/muletillas/apodos que se repiten en varios tramos, con quién las dice.
4. LAS 5-8 ESCENAS más absurdas de todo el chat: quién la inició, quién la escaló, cómo terminó, con quotes.
5. PROMESAS Y PREDICCIONES que envejecieron mal (con fecha si está).
6. ARCO: qué cambió del principio al final del chat.
Sé denso, fiel y literal: cero opinión, cero chistes tuyos. Toda quote debe venir textual de las notas.`;

async function consolidarNotas(notas: string, grupo: string): Promise<string> {
  const { text } = await generateText({
    model: "anthropic/claude-haiku-4.5",
    system: PROMPT_CONSOLIDADOR,
    prompt: `NOTAS POR TRAMO del chat "${grupo}" (en orden cronológico):\n\n${notas}`,
    maxOutputTokens: 8_000,
    temperature: 0.3,
    maxRetries: 2,
    abortSignal: AbortSignal.timeout(110_000),
  });
  return text;
}

// Recorte balanceado de las notas: antes se tomaban los PRIMEROS 90k chars y
// el escritor nunca veía la mitad final del chat (lo más reciente). Ahora, si
// no caben, van el arranque y, sobre todo, el final; el medio lo cubre la
// síntesis global.
function recortarNotas(notas: string, max: number): string {
  if (notas.length <= max) return notas;
  const inicio = Math.floor(max * 0.4);
  const fin = max - inicio;
  return `${notas.slice(0, inicio)}\n\n[… tramos intermedios omitidos, la SÍNTESIS GLOBAL de arriba ya los cubre …]\n\n${notas.slice(-fin)}`;
}

export function totalTramos(chat: string): number {
  return Math.ceil(chat.length / TAM_TRAMO);
}

// Extrae notas por lotes A PARTIR del tramo `desde`, respetando el reloj: si
// no queda presupuesto para otro lote completo, devuelve lo hecho y el caller
// persiste y retoma en la siguiente invocación (extracción reanudable; antes
// un chat de 16 tramos podía exceder los 300s y morir sin persistir NADA).
async function extraerNotas(
  chat: string,
  grupo: string,
  desde: number,
  restanteMs: () => number,
): Promise<{ texto: string; tramosHechos: number }> {
  const tramos: string[] = [];
  for (let i = 0; i < chat.length; i += TAM_TRAMO) {
    tramos.push(chat.slice(i, i + TAM_TRAMO));
  }
  const notas: string[] = [];
  let hechos = 0;
  for (let inicio = desde; inicio < tramos.length; inicio += LOTE_EXTRACCION) {
    // Un lote tarda hasta ~110s; sin reloj para lote + margen de persistencia,
    // se corta aquí y el respaldo retoma.
    if (inicio > desde && restanteMs() < 150_000) break;
    const lote = tramos.slice(inicio, inicio + LOTE_EXTRACCION);
    const resultados = await Promise.all(
      lote.map((t, j) => {
        const idx = inicio + j;
        return generateText({
          model: "anthropic/claude-haiku-4.5",
          system: PROMPT_EXTRACTOR,
          prompt: `TRAMO ${idx + 1} de ${tramos.length} del chat "${grupo}" (los tramos van en orden cronológico):\n\n${t}`,
          // 250k chars de chat comprimidos a 3k tokens de notas perdía joyas;
          // 5k da ~65% más espacio por ~$0.15 extra en un chat monstruo.
          maxOutputTokens: 5_000,
          temperature: 0.3,
          maxRetries: 2,
          abortSignal: AbortSignal.timeout(110_000),
        })
          .then(
            (r) =>
              `── NOTAS DEL TRAMO ${idx + 1}/${tramos.length} ──\n${r.text}`,
          )
          .catch(
            (e) =>
              `── TRAMO ${idx + 1}/${tramos.length}: extracción falló (${e instanceof Error ? e.name : "error"}) ──`,
          );
      }),
    );
    notas.push(...resultados);
    hechos += lote.length;
  }
  return { texto: notas.join("\n\n"), tramosHechos: hechos };
}

// Auto-encadenado: re-invoca la generación en una FUNCIÓN NUEVA (reloj de
// 300s fresco) vía el route de respaldo. Es lo que hace que nadie tenga que
// tocar "reintentar" jamás: los cortes de etapa y los fallos se retoman solos
// aunque el usuario haya cerrado la pestaña. waitUntil mantiene viva esta
// función (ociosa, costo ~0 en Fluid) mientras el eslabón siguiente corre.
function encadenar(id: string, baseUrl: string | undefined, delayMs: number) {
  const base =
    baseUrl ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://elpanabeto.com");
  // La ESPERA vive en el eslabón nuevo (esperaMs), no aquí: esta función
  // puede estar a segundos de su deadline y solo necesita DESPACHAR la
  // petición: el route encadenado responde al instante y luego trabaja.
  waitUntil(
    fetch(`${base}/api/reportes/generar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, esperaMs: Math.max(1, delayMs) }),
      cache: "no-store",
    }).catch(() => {}),
  );
}

// Tope de reintentos automáticos del servidor por fallo real (los cortes de
// etapa no cuentan: esos son avance normal, no fallos).
const MAX_REINTENTOS = 3;

// Genera el reporte server-side a partir del job guardado. Idempotente:
// - si ya está listo, no regenera;
// - si otra corrida sigue viva (procesando reciente), no arranca otra.
// Se llama tanto desde waitUntil (al crear) como desde el route de respaldo.
export async function ejecutarGeneracion(
  id: string,
  baseUrl?: string,
  opts?: {
    // true cuando el caller ACABA de registrar el pago (retorno/canjear): se
    // salta la re-lectura del gate, que podría venir con lag y dejar un
    // reporte pagado atascado en "pendiente" si el usuario cierra la pestaña.
    pagoConfirmado?: boolean;
    // Reloj REAL disponible cuando el caller ya gastó parte de su ventana
    // (eslabones encadenados con espera). Default: función fresca.
    presupuestoMs?: number;
  },
): Promise<ResultadoGeneracion> {
  // Presupuesto de reloj: la función muere a los 300s (maxDuration). Cada
  // paso largo se acota contra lo que queda, con margen para persistir; si no
  // alcanza, la corrida cierra limpia y se encadena un eslabón fresco.
  const inicio = Date.now();
  const limiteMs = Math.max(30_000, opts?.presupuestoMs ?? 290_000);
  const restanteMs = () => limiteMs - (Date.now() - inicio);

  let g = await leerReporte(id);
  if (!g) return "no-existe";
  if (g.reporte || g.reporte2 || g.reporteMd) return "listo";
  if (!g.inputs?.chat) return "error";

  // GATE DE PAGO (flujo v2): los jobs "pendiente" NO se generan hasta que el
  // pago esté registrado. Este código corre desde un route público (respaldo
  // del cliente): sin el gate, cualquiera dispararía generaciones que cuestan
  // plata. Los docs viejos (estado "generando"/"error" del flujo anterior) no
  // pasan por aquí y terminan normal.
  if (
    g.estado === "pendiente" &&
    !opts?.pagoConfirmado &&
    !estaDesbloqueado(await leerPagos(id))
  ) {
    return "pendiente";
  }

  // Referencia local (TypeScript pierde el narrowing al reasignar g).
  const entradas = g.inputs;
  if (
    g.procesando &&
    Date.now() - Date.parse(g.procesando) < VENTANA_PROCESANDO_MS
  ) {
    return "generando";
  }

  // Marcar en proceso para bloquear duplicados, y en estado "generando": si
  // venimos de "pendiente" (recién pagado) o de un "error" (reintento), el
  // poller del cliente debe ver la corrida viva, no el estado viejo.
  const miMarca = new Date().toISOString();
  g = { ...g, estado: "generando", procesando: miMarca };
  await guardarReporte(g);
  // El candado es "leer y escribir" sin atomicidad: dos corridas casi
  // simultáneas (waitUntil del pago + respaldo del cliente) podrían pasar el
  // chequeo a la vez y facturar DOBLE. Espera corta y re-lectura de origen:
  // si otra corrida pisó la marca, esta se retira.
  await new Promise((r) => setTimeout(r, 1200));
  const relectura = await leerReporte(id);
  if (relectura?.procesando && relectura.procesando !== miMarca) {
    return "generando";
  }

  const errores: string[] = [];

  // Pipeline de 2 pasadas: si el chat es grande, Haiku lo lee COMPLETO por
  // tramos y cosecha el material; Opus escribe con las notas + una muestra
  // cruda (para calibrar las voces reales). Las notas se persisten: si la
  // función muere a mitad, el reintento retoma directo en la escritura.
  // Cierre limpio de etapa: persiste lo avanzado, suelta el candado y deja
  // que la siguiente invocación (respaldo del cliente) retome con reloj lleno.
  const cerrarEtapa = async (): Promise<ResultadoGeneracion> => {
    // g! : el closure pierde el narrowing del `let`, pero aquí g siempre existe.
    await guardarReporte({ ...g!, procesando: undefined });
    // Encadenar la siguiente etapa YA, sin depender de que el cliente tenga
    // la página abierta. 3s de respiro para que el blob asiente.
    encadenar(id, baseUrl, 3_000);
    return "generando";
  };

  let material: string;
  if (entradas.chat.length > UMBRAL_EXTRACCION) {
    const tramosTotal = totalTramos(entradas.chat);
    // Docs de antes del campo notasTramos: notas presentes = completas.
    const tramosHechos =
      entradas.notasTramos ?? (entradas.notas != null ? tramosTotal : 0);
    if (tramosHechos < tramosTotal) {
      try {
        const r = await extraerNotas(
          entradas.chat,
          g.grupo,
          tramosHechos,
          restanteMs,
        );
        entradas.notas = [entradas.notas, r.texto]
          .filter(Boolean)
          .join("\n\n");
        entradas.notasTramos = tramosHechos + r.tramosHechos;
        // Si TODOS los tramos fallaron (outage del extractor), las "notas" son
        // puros marcadores de fallo: se descartan y el escritor usa el
        // muestreo clásico: mejor un reporte con menos material que ninguno.
        if (
          entradas.notasTramos >= tramosTotal &&
          !entradas.notas.includes("NOTAS DEL TRAMO")
        ) {
          entradas.notas = "";
        }
        g = { ...g, inputs: entradas, procesando: new Date().toISOString() };
        await guardarReporte(g);
        if (entradas.notasTramos < tramosTotal) return cerrarEtapa();
      } catch (e) {
        errores.push(
          `extraccion: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`.slice(0, 300),
        );
        // Si la extracción falla por completo, seguimos con el muestreo
        // clásico: mejor un reporte con el 10% del chat que ninguno.
      }
    }
    if (entradas.notas && !entradas.sintesis) {
      // La síntesis tarda hasta 110s: si el reloj no da para ella + margen,
      // cerrar limpio: lo extraído ya quedó persistido.
      if (restanteMs() < 150_000) return cerrarEtapa();
      try {
        const sintesis = await consolidarNotas(entradas.notas, g.grupo);
        entradas.sintesis = sintesis;
      } catch (e) {
        errores.push(
          `sintesis: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`.slice(0, 300),
        );
        // Marcador persistido: se intentó y falló, NO reintentar en cada
        // corrida (un timeout aquí dejaba un bucle que quemaba una llamada
        // por invocación sin llegar jamás al escritor). El material tratará
        // un valor corto como "sin síntesis".
        entradas.sintesis = `(fallida: ${e instanceof Error ? e.name : "error"})`;
      }
      g = { ...g, inputs: entradas, procesando: new Date().toISOString() };
      await guardarReporte(g);
    }
    // La escritura de un reporte grande tarda 2-4 min legítimos: si tras la
    // extracción/síntesis no queda ese reloj, NO arrancar una generación que
    // la plataforma va a matar a mitad (se factura y no deja ni error).
    if (restanteMs() < 180_000) return cerrarEtapa();
    // Una síntesis real mide varios miles de chars; un marcador de fallo, no.
    const sintesisUtil =
      entradas.sintesis && entradas.sintesis.length > 300
        ? entradas.sintesis
        : undefined;
    material = entradas.notas
      ? (sintesisUtil
          ? `SÍNTESIS GLOBAL del chat COMPLETO (${entradas.chat.length.toLocaleString("es-PA")} caracteres leídos al 100%). La sección OBSESIONES GLOBALES está ranqueada por recurrencia real: el top de esa lista ES la columna vertebral del reporte: si el top 3 no aparece con fuerza, el reporte está mal armado. No construyas el reporte sobre cosas mencionadas una sola vez:\n\n${sintesisUtil}\n\n`
          : "") +
        `NOTAS DE INVESTIGACIÓN por tramo (detalle, en orden cronológico; todo lo citado es textual del chat):\n\n${recortarNotas(entradas.notas, sintesisUtil ? 60_000 : 90_000)}\n\n` +
        `MUESTRA CRUDA del chat (solo para calibrar voces, ortografía y tono; el material de arriba manda):\n\n${muestrearChat(entradas.chat, 20_000)}`
      : `Chat exportado (muestreado):\n\n${muestrearChat(entradas.chat)}`;
  } else {
    material = `Chat exportado COMPLETO. Antes de escribir, identifica qué temas, bits y rituales se REPITEN más a lo largo de todo el chat: esas obsesiones recurrentes son la columna vertebral del reporte, no lo que se mencionó una sola vez:\n\n${entradas.chat}`;
  }

  const opciones = {
    // v3: SALIDA LIBRE en markdown (como Brandon), sin molde JSON. El molde
    // producía "modo cumplimiento" y botaba reportes buenos por validación.
    temperature: 1,
    maxRetries: entradas.notas ? 0 : 2,
    system: promptSistema({
      tipo: g.tipo,
      idioma: entradas.idioma ?? "",
      contexto: g.contexto ?? "",
      nota: entradas.nota ?? "",
      nombreUsuario: g.nombreUsuario ?? "",
      pais: entradas.pais ?? "",
      intensidad: entradas.intensidad ?? "normal",
    }),
    prompt:
      `Nombre del grupo: ${g.grupo || "(sin nombre)"}\n\n` +
      (g.participantes?.length
        ? `Mensajes por integrante (reales, útiles cuando la cifra ES el chiste): ${(() => {
            const total = g.participantes.reduce((a, p) => a + p.mensajes, 0) || 1;
            return g.participantes
              .map((p) => `${p.nombre}: ${p.mensajes.toLocaleString("es-PA")} (${Math.round((p.mensajes / total) * 100)}%)`)
              .join(" · ");
          })()}\n\n`
        : "") +
      (g.stats
        ? `Estadísticas reales del grupo (ya calculadas, úsalas para uno o dos chistes: quién escribe a esas horas, qué dice de ellos el día/mes pico): ${resumenStats(g.stats)}\n\n`
        : "") +
      material,
    // OJO (bug real medido con un chat de 15 integrantes): el gateway activa
    // razonamiento interno (~5-7k tokens que CUENTAN como salida) y el reporte
    // completo de un grupo grande pesa ~13k más (peor caso medido: 18.1k). Con
    // topes de 9k/14k el JSON salía TRUNCADO (finishReason "length") y TODA
    // generación de un chat real fallaba con "No output generated". 32k = casi
    // el doble del peor caso medido; el tope no cuesta nada si no se usa.
    maxOutputTokens: 32_000,
  };

  try {
    // OJO (bug real): en chats GIGANTES (vía pipeline, con notas) la escritura
    // con Opus normal excede su ventana de 270s, el respaldo no cabe en los
    // 300s de la función y muere SIN registrar error → bucle infinito de
    // "generando". Para esos, la escritura va con opus-fast (2x velocidad,
    // termina en ~2 min): un intento que TERMINA es más barato que diez que
    // mueren. El ahorro del pipeline ya lo hizo Haiku en la lectura.
    const elegido = process.env.MODELO_REPORTE ?? "anthropic/claude-opus-5-fast";
    // Si una corrida previa de ESTE reporte ya murió por timeout/abort DEL
    // ESCRITOR (no de extracción/síntesis: sus errores llevan otro prefijo),
    // el reintento degrada a opus-fast (velocidad probada: ~2 min para 18k
    // tokens) en vez de re-fallar con el mismo modelo y quemar plata en
    // generaciones cortadas. Aplica en TODOS los tamaños de chat.
    const timeoutPrevio = (g.errores ?? []).some((er) =>
      /^escritor .*(Timeout|Abort)/i.test(er),
    );
    const preferido = timeoutPrevio ? "anthropic/claude-opus-5-fast" : elegido;
    // Ventana deseada por modelo, SIEMPRE acotada al reloj que queda (una
    // generación que la plataforma mata a mitad se factura y no deja ni
    // error registrado: el peor de los mundos).
    const ventana = (deseada: number) =>
      Math.max(60_000, Math.min(deseada, restanteMs() - 25_000));
    let texto: string;
    try {
      // Timeout con abort: si el modelo se CUELGA (no lanza, solo no responde),
      // lo cortamos en vez de colgar la generación entera.
      const r1 = await generateText({
        model: preferido,
        ...opciones,
        // OJO: un chat REAL grande (15 integrantes, 130k chars) tarda 2-4 min
        // legítimos escribiendo ~18k tokens. Timeouts cortos mataban
        // generaciones buenas; los modelos sin "-fast" escriben más lento y
        // necesitan la ventana amplia.
        abortSignal: AbortSignal.timeout(
          ventana(
            entradas.notas ? 250_000 : /fast/.test(preferido) ? 210_000 : 265_000,
          ),
        ),
      });
      texto = r1.text;
    } catch (e) {
      // Los issues de Zod dicen EXACTAMENTE qué campo violó el schema.
      const causaErr = e instanceof Error ? (e as Error & { cause?: { cause?: { issues?: unknown } } }).cause : undefined;
      const issues = causaErr?.cause?.issues
        ? JSON.stringify(causaErr.cause.issues).slice(0, 700)
        : String(causaErr ?? "").slice(0, 200);
      errores.push(`escritor ${preferido}: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)} | issues: ${issues}`.slice(0, 900));
      // Con notas (monstruo) el fallback a Sonnet jamás cabe: no quemar plata.
      if (/sonnet/.test(preferido) || entradas.notas) throw e;
      // Sonnet solo entra si queda reloj REAL para escribir un reporte
      // completo (fallo rápido del primario, p. ej. 5xx). Si el primario se
      // comió el reloj, mejor cerrar en error: el reintento degrada a
      // opus-fast y entra con presupuesto completo.
      if (restanteMs() < 120_000) throw e;
      console.warn(
        "Falló/colgó el modelo preferido; usando Sonnet:",
        e instanceof Error ? e.message : String(e),
      );
      const r2 = await generateText({
        model: "anthropic/claude-sonnet-5",
        ...opciones,
        abortSignal: AbortSignal.timeout(ventana(260_000)),
      });
      texto = r2.text;
    }

    // Validación mínima (no molde): que sea un reporte de verdad.
    if (!/^#\s+.+/m.test(texto) || texto.trim().length < 1500) {
      throw new Error("La salida no parece un reporte completo (sin título o demasiado corta).");
    }

    const telefono = entradas.telefono;
    // Guardar listo y BORRAR los insumos (el chat no queda guardado).
    await guardarReporte({
      ...g,
      estado: "listo",
      reporteMd: texto,
      inputs: undefined,
      procesando: undefined,
    });

    try {
      await incrementarContador();
    } catch (e) {
      console.error("Contador falló (no bloquea el reporte):", e);
    }

    if (telefono && whatsappConfigurado()) {
      const base =
        baseUrl ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : "https://elpanabeto.com");
      try {
        await enviarReporteWhatsApp(telefono, tituloDeMd(texto), `${base}/r/${id}`);
      } catch (e) {
        console.error("WhatsApp falló (no bloquea el reporte):", e);
      }
    }

    return "listo";
  } catch (e) {
    errores.push(`fallback: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`.slice(0, 300));
    console.error("Error generando reporte:", e);
    // ANTI-CARRERA: si otra corrida terminó bien mientras esta fallaba, NO
    // pisar el reporte bueno con un "error" tardío.
    const actual = await leerReporte(id);
    if (actual?.reporte || actual?.reporte2 || actual?.reporteMd) return "listo";

    // NADIE toca "reintentar": el servidor se levanta solo. Mientras queden
    // reintentos, el estado sigue en "generando" (el cliente nunca ve un
    // error transitorio) y se encadena una corrida nueva con backoff; la
    // degradación a opus-fast del arranque hace que el reintento entre con
    // modelo de velocidad probada si el fallo fue timeout del escritor.
    const intentos = (actual ?? g).reintentos ?? 0;
    if (intentos < MAX_REINTENTOS) {
      await guardarReporte({
        ...(actual ?? g),
        estado: "generando",
        procesando: undefined,
        reintentos: intentos + 1,
        errores,
      });
      encadenar(id, baseUrl, 45_000 * (intentos + 1));
      return "generando";
    }
    // Se agotaron los reintentos del servidor: "error" terminal. La página lo
    // muestra en tono calmado y sin botones; los insumos se CONSERVAN, así
    // que un respaldo posterior (o nosotros a mano) aún puede rescatarlo.
    await guardarReporte({
      ...(actual ?? g),
      estado: "error",
      procesando: undefined,
      reintentos: intentos,
      errores,
    });
    return "error";
  }
}
