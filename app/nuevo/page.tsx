"use client";

import { strFromU8, unzipSync } from "fflate";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatWhatsAppDark } from "@/app/chat-demo";
import {
  analizarChat,
  analizarStats,
  muestrearChat,
  nombreGrupoDesdeArchivo,
  type Participante,
} from "@/lib/parse-chat";
import { guardarReporteLocal } from "@/lib/mis-reportes";
import { TutorialExportar } from "./tutorial";

// Lee los bytes del archivo de forma robusta. El navegador a veces "vence"
// la referencia (archivo movido, screenshot temporal, iCloud sin bajar);
// se reintenta con FileReader y, si falla, se lanza un mensaje claro.
async function leerBytes(f: File): Promise<Uint8Array> {
  try {
    return new Uint8Array(await f.arrayBuffer());
  } catch {
    try {
      const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as ArrayBuffer);
        fr.onerror = () => reject(fr.error);
        fr.readAsArrayBuffer(f);
      });
      return new Uint8Array(buf);
    } catch {
      throw new Error(
        "No pudimos leer ese archivo. Puede que lo hayas movido o venga de iCloud sin descargar. Bájalo a tu computadora y vuelve a subirlo.",
      );
    }
  }
}

// WhatsApp a veces exporta un .zip con el _chat.txt adentro.
async function extraerTexto(f: File): Promise<string> {
  const bytes = await leerBytes(f);
  if (f.name.toLowerCase().endsWith(".zip") || f.type === "application/zip") {
    const datos = unzipSync(bytes);
    const txts = Object.entries(datos).filter(([n]) =>
      n.toLowerCase().endsWith(".txt"),
    );
    if (!txts.length)
      throw new Error("Ese zip no trae ningún .txt adentro. Exporta de nuevo con “Sin archivos”.");
    txts.sort((a, b) => b[1].length - a[1].length);
    return strFromU8(txts[0][1]);
  }
  return new TextDecoder("utf-8").decode(bytes);
}

// Reduce y convierte cualquier imagen a JPEG liviano antes de enviarla.
function comprimirImagen(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(f);
    const img = new window.Image();
    img.onload = () => {
      const max = 1600;
      const escala = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No pudimos leer esa imagen. Intenta con JPG o PNG."));
    };
    img.src = url;
  });
}

const TOTAL_PASOS = 8;

const idiomas = ["Español", "English", "Português", "Français", "Italiano"];

const tiposChat = [
  { emoji: "💌", nombre: "Pareja o crush", desc: "Novi@, situationship, la ex…" },
  { emoji: "😂", nombre: "Grupo de panas", desc: "El chat donde todo se vuelve chiste interno…" },
  { emoji: "🫶", nombre: "Mejor amig@", desc: "La persona que sabe demasiado…" },
  { emoji: "🏠", nombre: "Familia", desc: "Mamá, tíos, primos, logística y bochinche…" },
  { emoji: "📋", nombre: "Trabajo", desc: "El proyecto, el equipo, el jefe…" },
  { emoji: "🤷", nombre: "Otro", desc: "Cualquier chat que te dé curiosidad…" },
];

const paises = [
  "🇵🇦 Panamá",
  "🇲🇽 México",
  "🇨🇴 Colombia",
  "🇦🇷 Argentina",
  "🇨🇱 Chile",
  "🇵🇪 Perú",
  "🇻🇪 Venezuela",
  "🇪🇨 Ecuador",
  "🇬🇹 Guatemala",
  "🇨🇺 Cuba",
  "🇧🇴 Bolivia",
  "🇩🇴 República Dominicana",
  "🇭🇳 Honduras",
  "🇵🇾 Paraguay",
  "🇸🇻 El Salvador",
  "🇳🇮 Nicaragua",
  "🇨🇷 Costa Rica",
  "🇺🇾 Uruguay",
  "🇵🇷 Puerto Rico",
  "🇪🇸 España",
  "🇺🇸 Estados Unidos (latinos)",
];

const mensajesEspera = [
  "Beto está recibiendo el chat…",
  "Contando los mensajes, aguanta…",
  "Armando el expediente…",
  "Poniendo el chat sobre la mesa…",
];

export default function NuevoReporte() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [idioma, setIdioma] = useState("Español");
  const [contexto, setContexto] = useState("");
  const [nota, setNota] = useState("");
  const [chat, setChat] = useState("");
  const [archivo, setArchivo] = useState("");
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  // Renombres: {nombre original en el chat -> nombre corregido}. Útil cuando el
  // usuario tiene a la gente guardada distinto ("Mami ❤️" → "Rosa").
  const [alias, setAlias] = useState<Record<string, string>>({});
  const [editarNombres, setEditarNombres] = useState(false);
  const [totalMensajes, setTotalMensajes] = useState(0);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [grupo, setGrupo] = useState("");
  const [foto, setFoto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [tono, setTono] = useState<"clasico" | "yeye" | "profundo">("clasico");
  const [pais, setPais] = useState("");
  const [intensidad, setIntensidad] = useState<"suave" | "normal" | "salvaje">(
    "normal",
  );
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajeIdx, setMensajeIdx] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [arrastrandoFoto, setArrastrandoFoto] = useState(false);
  const inputArchivo = useRef<HTMLInputElement>(null);
  const inputFoto = useRef<HTMLInputElement>(null);

  async function manejarArchivoChat(f: File) {
    try {
      procesarTexto(await extraerTexto(f), f.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos leer ese archivo.");
    }
  }

  async function manejarFoto(f: File) {
    setError("");
    if (f.size > 15 * 1024 * 1024) {
      setError("Esa foto pesa demasiado (máx. 15 MB).");
      return;
    }
    try {
      setFoto(await comprimirImagen(f));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos leer esa imagen.");
    }
  }

  useEffect(() => {
    if (!cargando) return;
    const t = setInterval(
      () => setMensajeIdx((i) => (i + 1) % mensajesEspera.length),
      4000,
    );
    return () => clearInterval(t);
  }, [cargando]);

  // Borrador automático: guarda lo que llevas para que NUNCA pierdas el
  // progreso si se corta, cambias de app o se recarga la página.
  const CLAVE_BORRADOR = "elpanabeto:borrador";
  const restaurado = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAVE_BORRADOR);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.chat) setChat(d.chat);
        if (d.grupo) setGrupo(d.grupo);
        if (d.nota) setNota(d.nota);
        if (d.contexto) setContexto(d.contexto);
        if (d.pais) setPais(d.pais);
        if (d.nombreUsuario) setNombreUsuario(d.nombreUsuario);
        if (d.tono) setTono(d.tono);
        if (d.intensidad) setIntensidad(d.intensidad);
        if (d.archivo) setArchivo(d.archivo);
        if (Array.isArray(d.participantes)) setParticipantes(d.participantes);
        if (d.totalMensajes) setTotalMensajes(d.totalMensajes);
        if (typeof d.paso === "number" && d.chat) setPaso(d.paso);
      }
    } catch {}
    restaurado.current = true;
  }, []);

  useEffect(() => {
    if (!restaurado.current) return;
    if (!chat) return; // solo guardamos cuando ya hay un chat cargado
    try {
      localStorage.setItem(
        CLAVE_BORRADOR,
        JSON.stringify({
          chat,
          grupo,
          nota,
          contexto,
          pais,
          nombreUsuario,
          tono,
          intensidad,
          archivo,
          participantes,
          totalMensajes,
          paso,
        }),
      );
    } catch {}
  }, [
    chat,
    grupo,
    nota,
    contexto,
    pais,
    nombreUsuario,
    tono,
    intensidad,
    archivo,
    participantes,
    totalMensajes,
    paso,
  ]);

  // Sincronizacion con el historial del navegador: cada avance agrega una
  // entrada (#paso-N) para que el boton atras del navegador regrese al paso
  // anterior en vez de sacar al usuario del sitio. El handler de popstate
  // solo lee el hash y actualiza el estado; nunca vuelve a hacer pushState,
  // asi no se generan loops.
  useEffect(() => {
    function alNavegarHistorial() {
      const m = window.location.hash.match(/^#paso-(\d+)$/);
      const p = m ? Number(m[1]) : 1;
      setError("");
      setPaso(Math.min(Math.max(p, 1), TOTAL_PASOS));
    }
    window.addEventListener("popstate", alNavegarHistorial);
    return () => window.removeEventListener("popstate", alNavegarHistorial);
  }, []);

  function avanzar() {
    setError("");
    const sig = Math.min(paso + 1, TOTAL_PASOS);
    if (sig === paso) return;
    window.history.pushState(null, "", `#paso-${sig}`);
    setPaso(sig);
  }

  function retroceder() {
    setError("");
    if (paso <= 1) return;
    if (window.location.hash === `#paso-${paso}`) {
      // La entrada actual la agregamos nosotros: dejar que popstate
      // haga el cambio de paso al volver.
      window.history.back();
      return;
    }
    // Sin entrada propia en el historial (por ejemplo, borrador restaurado):
    // retroceder directo sin tocar el historial.
    setPaso(paso - 1);
  }

  function procesarTexto(texto: string, nombreArchivo?: string) {
    setChat(texto);
    const { participantes: parts, total } = analizarChat(texto);
    setParticipantes(parts);
    setTotalMensajes(total);
    if (nombreArchivo) {
      setArchivo(nombreArchivo);
      const g = nombreGrupoDesdeArchivo(nombreArchivo);
      if (g && !grupo) setGrupo(g);
    }
    setError("");
  }

  async function enviar() {
    setError("");
    setCargando(true);
    try {
      // Renombres del usuario: se aplican al chat completo (formato iOS "] X:"
      // y Android "- X:"), a la lista de participantes y a su propio nombre,
      // para que Beto y el reporte usen los nombres que el grupo entiende.
      const cambios = Object.entries(alias)
        .map(([o, n]) => [o, n.trim()] as [string, string])
        .filter(([o, n]) => n && n !== o);
      let chatFinal = chat;
      for (const [o, n] of cambios) {
        chatFinal = chatFinal
          .split(`] ${o}:`)
          .join(`] ${n}:`)
          .split(`- ${o}:`)
          .join(`- ${n}:`);
      }
      const mapa = Object.fromEntries(cambios);
      const res = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grupo,
          tipo: tono,
          // El chat viaja COMPLETO (hasta ~4 MB): el server lo lee entero por
          // tramos con el pipeline de 2 pasadas. Solo chats monstruosos se
          // muestrean por encima de ese tope.
          chat: muestrearChat(chatFinal, 4_000_000),
          mensajes: totalMensajes || undefined,
          idioma,
          contexto,
          nota,
          nombreUsuario: mapa[nombreUsuario] ?? nombreUsuario,
          foto,
          telefono,
          pais,
          intensidad,
          participantes: participantes
            .slice(0, 15)
            .map((p) => ({ ...p, nombre: mapa[p.nombre] ?? p.nombre })),
          stats: analizarStats(chatFinal),
        }),
      });
      const texto = await res.text();
      let data: { id?: string; error?: string };
      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error(
          res.status === 413
            ? "El envío quedó muy pesado. Quita la foto o inténtalo de nuevo."
            : `El servidor respondió con un error (${res.status}). Intenta de nuevo.`,
        );
      }
      if (!res.ok) throw new Error(data.error || "Error inesperado");
      if (data.id) guardarReporteLocal(data.id, grupo);
      try {
        localStorage.removeItem(CLAVE_BORRADOR);
      } catch {}
      router.push(`/r/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper px-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/beto.jpg"
          alt="Beto"
          className="h-20 w-20 rounded-full border border-line object-cover"
        />
        <div className="mt-6 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
        <h1 className="font-display mt-8 text-3xl font-semibold">
          {mensajesEspera[mensajeIdx]}
        </h1>
        <p className="mt-4 text-muted">
          Un segundito: Beto está recibiendo el chat y armando el expediente.
        </p>
      </div>
    );
  }

  const botonPrimario =
    "w-full rounded-full bg-ink px-6 py-3.5 text-center font-medium text-paper transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-ink sm:w-auto sm:py-3";

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between text-sm text-muted">
        {paso > 1 ? (
          <button
            onClick={retroceder}
            aria-label="Volver"
            className="-ml-3 flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors hover:bg-card"
          >
            ←
          </button>
        ) : (
          <span />
        )}
        <span>
          {paso} de {TOTAL_PASOS}
        </span>
      </div>

      {paso === 1 && (
        <section className="mt-10">
          <h1 className="font-display text-3xl font-semibold">
            ¿En qué idioma quieres el reporte?
          </h1>
          <div className="mt-6 flex flex-wrap gap-2">
            {idiomas.map((i) => (
              <button
                key={i}
                onClick={() => setIdioma(i)}
                className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                  idioma === i
                    ? "border-accent bg-card font-medium"
                    : "border-line hover:border-muted"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <button onClick={avanzar} className={`${botonPrimario} mt-10`}>
            Continuar →
          </button>
        </section>
      )}

      {paso === 2 && (
        <section className="mt-10">
          <h1 className="font-display text-3xl font-semibold">
            ¿De cuál chat estamos hablando?
          </h1>
          <p className="mt-2 text-muted">
            Beto saca un buen reporte de cualquier chat.
          </p>
          <div className="mt-6 space-y-3">
            {tiposChat.map((t) => (
              <button
                key={t.nombre}
                onClick={() => {
                  setContexto(t.nombre);
                  avanzar();
                }}
                className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
                  contexto === t.nombre
                    ? "border-accent bg-card"
                    : "border-line hover:border-muted"
                }`}
              >
                <span className="text-2xl">{t.emoji}</span>
                <span>
                  <span className="block font-medium">{t.nombre}</span>
                  <span className="block text-sm text-muted">{t.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {paso === 3 && (
        <section className="mt-10">
          <h1 className="font-display text-3xl font-semibold">
            ¿Le pides algo especial a Beto?
          </h1>
          <p className="mt-2 text-muted">
            Aquí puedes pedirle algo puntual: que se ensañe con alguien por un
            tema específico, que saque cierta historia, o que baje el tono con
            alguna persona. Beto te hace caso.
          </p>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ej: jódele durísimo a Juan con lo del gym · expón a la que siempre deja en visto · saca lo del viaje a Bocas · no seas tan duro con mi mamá"
            rows={5}
            className="mt-6 w-full rounded-md border border-line bg-card px-4 py-3 outline-none transition-colors focus:border-accent"
          />
          <button onClick={avanzar} className={`${botonPrimario} mt-8`}>
            {nota.trim() ? "Continuar →" : "Saltar →"}
          </button>
        </section>
      )}

      {paso === 4 && (
        <section className="mt-10">
          <h1 className="font-display text-3xl font-semibold">
            Compartirlo es la mejor parte.
          </h1>
          <p className="mt-2 text-muted">
            Cuando el link cae en el grupo, el chat no se calla en una semana.
          </p>
          <div className="mx-auto mt-8 max-w-sm">
            <ChatWhatsAppDark
              titulo="Los Panas del Kilo"
              miembros="Kike, Nando, Chino y 8 más"
              mensajes={[
                {
                  linkCard: true,
                  texto: "Señores. Léanlo completo.",
                  hora: "5:38 p.m.",
                  propia: true,
                },
                {
                  de: "Kike",
                  colorDe: "text-[#53bdeb]",
                  texto: "¿QUIÉN LE DIO NUESTRO CHAT A ESE SEÑOR?",
                  hora: "5:39 p.m.",
                  reaccion: "😂 3",
                },
                {
                  de: "Nando",
                  colorDe: "text-[#e77f51]",
                  texto: "el apodo que me puso no me lo merezco",
                  hora: "5:40 p.m.",
                },
              ]}
            />
          </div>
          <button onClick={avanzar} className={`${botonPrimario} mt-8`}>
            Continuar →
          </button>
        </section>
      )}

      {paso === 5 && (
        <section className="mt-10">
          <h1 className="font-display text-3xl font-semibold">
            Exporta y sube tu conversación
          </h1>
          <TutorialExportar />
          <div className="mt-8 space-y-3">
            <div
              onClick={() => inputArchivo.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastrando(false);
                const f = e.dataTransfer.files?.[0];
                if (f) manejarArchivoChat(f);
              }}
              className={`cursor-pointer rounded-md border border-dashed px-4 py-8 text-center text-sm transition-colors ${
                arrastrando
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-muted text-muted hover:border-accent hover:text-accent"
              }`}
            >
              {archivo
                ? `✓ Archivo cargado: ${archivo}`
                : "Arrastra aquí el .txt o .zip exportado, o toca para buscarlo"}
            </div>
            {archivo && (
              <button
                type="button"
                onClick={() => {
                  setArchivo("");
                  setChat("");
                  setParticipantes([]);
                  setTotalMensajes(0);
                }}
                className="-m-2 inline-block p-2 text-sm text-muted underline transition-colors hover:text-accent"
              >
                ✕ Quitar archivo
              </button>
            )}
            <input
              ref={inputArchivo}
              type="file"
              accept=".txt,.zip,text/plain,application/zip"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) manejarArchivoChat(f);
                e.target.value = "";
              }}
            />
            <textarea
              value={archivo ? "" : chat}
              onChange={(e) => {
                setArchivo("");
                procesarTexto(e.target.value);
              }}
              placeholder="…o pega la conversación aquí"
              rows={6}
              className="w-full rounded-md border border-line bg-card px-4 py-3 text-base outline-none transition-colors focus:border-accent sm:text-sm"
              disabled={!!archivo}
            />
          </div>
          <p className="mt-4 text-xs text-muted">
            🔒 Tu chat se usa una sola vez para escribir el reporte y se borra
            apenas Beto termina (y si nunca pides el reporte, se borra solo a
            los 7 días). Nunca se usa para entrenar ningún modelo.
          </p>
          {error && (
            <p className="mt-4 rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
              {error}
            </p>
          )}
          <button
            onClick={() => {
              if (chat.trim().length < 500) {
                setError(
                  "Beto necesita más material: sube el archivo exportado o pega una conversación más larga.",
                );
                return;
              }
              avanzar();
            }}
            className={`${botonPrimario} mt-8`}
          >
            Continuar →
          </button>
        </section>
      )}

      {paso === 6 && (
        <section className="mt-10">
          <h1 className="font-display text-3xl font-semibold">
            {participantes.length >= 2
              ? "Esto fue lo que encontró Beto"
              : "Listo, Beto ya tiene el chat"}
          </h1>
          {participantes.length >= 2 ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted">
                {totalMensajes.toLocaleString("es-PA")} mensajes de{" "}
                {participantes.length} personas. Beto ya está frotándose las
                manos.
              </p>
              {participantes.slice(0, 10).map((p) => {
                const pct = Math.round((p.mensajes / totalMensajes) * 100);
                return (
                  <div key={p.nombre}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium">{p.nombre}</span>
                      <span className="text-muted">
                        {p.mensajes.toLocaleString("es-PA")} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-ink"
                        style={{
                          width: `${Math.max(2, (p.mensajes / participantes[0].mensajes) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-muted">
              No pudimos separar los participantes automáticamente, pero no
              importa: Beto los va a conocer leyendo.
            </p>
          )}
          <button onClick={avanzar} className={`${botonPrimario} mt-8`}>
            Continuar →
          </button>
        </section>
      )}

      {paso === 7 && (
        <section className="mt-10">
          <h1 className="font-display text-3xl font-semibold">
            Beto va a usar estos nombres
          </h1>
          <p className="mt-2 text-muted">
            Dinos cuál eres tú (pa&rsquo; que Beto no te perdone nada) y
            confirma el nombre del grupo.
          </p>
          {participantes.length >= 2 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {participantes.slice(0, 8).map((p) => (
                <button
                  key={p.nombre}
                  onClick={() => setNombreUsuario(p.nombre)}
                  className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                    nombreUsuario === p.nombre
                      ? "border-accent bg-card font-medium"
                      : "border-line hover:border-muted"
                  }`}
                >
                  {p.nombre}
                </button>
              ))}
            </div>
          )}
          <input
            type="text"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            placeholder="Tu nombre en el chat"
            className="mt-4 w-full rounded-md border border-line bg-card px-4 py-3 outline-none transition-colors focus:border-accent"
          />
          {participantes.length >= 2 && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setEditarNombres((v) => !v)}
                className="text-sm font-medium text-accent underline transition-colors hover:text-ink"
              >
                ✏️ ¿Algún nombre sale raro? Corrígelo aquí
              </button>
              {editarNombres && (
                <div className="mt-3 space-y-2 rounded-xl border border-line bg-card p-4">
                  <p className="text-xs text-muted">
                    Si tienes a la gente guardada distinto (&laquo;Mami ❤️&raquo;,
                    &laquo;El bro&raquo;), pon aquí el nombre con el que TODO el
                    grupo los conoce — así en el reporte se entiende quién es
                    quién.
                  </p>
                  {participantes.slice(0, 15).map((p) => (
                    <div key={p.nombre} className="flex items-center gap-2">
                      <span className="w-1/2 truncate text-sm text-muted">
                        {p.nombre}
                      </span>
                      <input
                        type="text"
                        value={alias[p.nombre] ?? ""}
                        onChange={(e) =>
                          setAlias((a) => ({ ...a, [p.nombre]: e.target.value }))
                        }
                        placeholder="Dejar igual"
                        className="w-1/2 rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="mt-6">
            <label htmlFor="grupo" className="block text-sm font-medium">
              Nombre del grupo
            </label>
            <input
              id="grupo"
              type="text"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="Ej: Los Panas del Barrio"
              className="mt-2 w-full rounded-md border border-line bg-card px-4 py-3 outline-none transition-colors focus:border-accent"
            />
          </div>
          <button onClick={avanzar} className={`${botonPrimario} mt-8`}>
            Continuar →
          </button>
        </section>
      )}

      {paso === 8 && (
        <section className="mt-10">
          <h1 className="font-display text-3xl font-semibold">
            ¿De dónde es el grupo?
          </h1>
          <p className="mt-2 text-muted">
            Así Beto se pone en tu tono y usa la jerga de tu país. Si lo dejas
            vacío, tira panameño.
          </p>
          <div className="relative mt-3">
            <select
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              className="w-full appearance-none rounded-md border border-line bg-card py-3 pl-4 pr-10 text-base outline-none transition-colors focus:border-accent"
            >
              <option value="">Elige el país…</option>
              {paises.map((p) => {
                // El emoji es solo visual; a Beto le llega el nombre limpio.
                const nombre = p.replace(/^[^\p{L}]+/u, "").trim();
                return (
                  <option key={p} value={nombre}>
                    {p}
                  </option>
                );
              })}
            </select>
            <svg
              aria-hidden
              viewBox="0 0 12 8"
              className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 fill-none stroke-muted stroke-2"
            >
              <path d="M1 1.5 6 6.5 11 1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="font-display mt-10 text-2xl font-semibold">
            ¿En qué tono lo quieres?
          </h2>
          <div className="mt-4 space-y-2">
            {(
              [
                ["clasico", "Clásico", "El Beto de siempre: humor sin filtro."],
                ["yeye", "Yeye / Fresa", "El niño bien de tu país: fresa, cheto, gomelo, pijo… Beto lo adapta."],
                ["profundo", "Profundo", "Beto se pone serio. Pa' parejas y pa'l que aguante."],
              ] as const
            ).map(([valor, nombre, desc]) => (
              <button
                key={valor}
                onClick={() => setTono(valor)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  tono === valor
                    ? "border-accent bg-card"
                    : "border-line hover:border-muted"
                }`}
              >
                <span className="block font-medium">{nombre}</span>
                <span className="block text-sm text-muted">{desc}</span>
              </button>
            ))}
          </div>

          <h2 className="font-display mt-10 text-2xl font-semibold">
            ¿Qué tan duro te da Beto?
          </h2>
          <p className="mt-2 text-muted">
            Pa&rsquo;l que no quiere sufrir tanto… o pa&rsquo;l que sí.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(
              [
                ["suave", "😇", "Suave", "Liviano, sin dolor"],
                ["normal", "😏", "Normal", "El filo justo"],
                ["salvaje", "💀", "Sin piedad", "A todo dar"],
              ] as const
            ).map(([valor, emoji, nombre, desc]) => (
              <button
                key={valor}
                onClick={() => setIntensidad(valor)}
                className={`rounded-lg border px-2 py-3 text-center transition-colors sm:px-3 ${
                  intensidad === valor
                    ? "border-accent bg-card"
                    : "border-line hover:border-muted"
                }`}
              >
                <span className="block text-2xl">{emoji}</span>
                <span className="mt-1 block text-sm font-medium leading-tight">{nombre}</span>
                <span className="mt-1 block text-xs leading-snug text-muted">{desc}</span>
              </button>
            ))}
          </div>

          <h2 className="font-display mt-10 text-2xl font-semibold">
            Ponle una foto al reporte
          </h2>
          <p className="mt-2 text-muted">
            Una foto del grupo lo hace sentir de colección. Es opcional. Beto
            no juzga… bueno, sí juzga, pero no por esto.
          </p>
          <div
            onClick={() => inputFoto.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrandoFoto(true);
            }}
            onDragLeave={() => setArrastrandoFoto(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrandoFoto(false);
              const f = e.dataTransfer.files?.[0];
              if (f) manejarFoto(f);
            }}
            className={`mt-6 flex w-full cursor-pointer flex-col items-center rounded-md border border-dashed px-4 py-8 text-sm transition-colors ${
              arrastrandoFoto
                ? "border-accent bg-accent/5 text-accent"
                : "border-muted text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={foto}
                alt="Foto del grupo"
                className="max-h-48 rounded-md object-cover"
              />
            ) : (
              "Arrastra una foto del grupo aquí, o toca para buscarla"
            )}
          </div>
          {foto && (
            <button
              type="button"
              onClick={() => setFoto("")}
              className="-mx-2 -mb-2 mt-1 inline-block p-2 text-sm text-muted underline transition-colors hover:text-accent"
            >
              ✕ Quitar foto
            </button>
          )}
          <input
            ref={inputFoto}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) manejarFoto(f);
              e.target.value = "";
            }}
          />
          <div className="mt-8">
            <label htmlFor="telefono" className="block text-sm font-medium">
              ¿Te avisamos por WhatsApp cuando esté listo? (opcional)
            </label>
            <input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+507 6123-4567"
              className="mt-2 w-full rounded-md border border-line bg-card px-4 py-3 outline-none transition-colors focus:border-accent"
            />
            <p className="mt-1.5 text-xs text-muted">
              Beto te escribe una sola vez, con el link de tu reporte. Nada de
              spam.
            </p>
          </div>
          {error && (
            <p className="mt-4 rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
              {error}
            </p>
          )}
          <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-accent"
            />
            <span>
              Confirmo que puedo compartir este chat y acepto los{" "}
              <a
                href="/terminos"
                target="_blank"
                className="underline transition-colors hover:text-accent"
              >
                Términos
              </a>{" "}
              y la{" "}
              <a
                href="/privacidad"
                target="_blank"
                className="underline transition-colors hover:text-accent"
              >
                Política de Privacidad
              </a>
              .
            </span>
          </label>
          <button
            onClick={() => {
              if (!aceptaTerminos) {
                setError("Acepta los términos para que Beto pueda leer el chat.");
                return;
              }
              enviar();
            }}
            className="mt-5 w-full rounded-full bg-accent px-6 py-4 text-center font-medium text-paper transition-colors hover:bg-ink disabled:opacity-40"
          >
            Que Beto lo lea →
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            Sin cuenta y sin instalar nada. En segundos ves el expediente armado
            y tú decides cuándo Beto lo escribe.
          </p>
        </section>
      )}
    </div>
  );
}
