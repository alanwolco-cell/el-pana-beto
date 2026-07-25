"use client";

import { strFromU8, unzipSync } from "fflate";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatWhatsAppDark } from "@/app/chat-demo";
import {
  analizarChat,
  muestrearChat,
  nombreGrupoDesdeArchivo,
  type Participante,
} from "@/lib/parse-chat";
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
      throw new Error("Ese zip no trae ningún .txt adentro. Exporta de nuevo con «Sin archivos».");
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

const mensajesEspera = [
  "Beto está abriendo el chat…",
  "Leyendo el bochinche completo…",
  "Beto encontró algo interesante…",
  "Tomando nota de los apodos…",
  "Beto se está riendo solo…",
  "Beto fue por un raspao, ya vuelve…",
  "Redactando el veredicto…",
  "Puliendo las banderas rojas…",
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
  const [totalMensajes, setTotalMensajes] = useState(0);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [grupo, setGrupo] = useState("");
  const [foto, setFoto] = useState("");
  const [telefono, setTelefono] = useState("");
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

  function avanzar() {
    setError("");
    setPaso((p) => Math.min(p + 1, TOTAL_PASOS));
  }

  function retroceder() {
    setError("");
    setPaso((p) => Math.max(p - 1, 1));
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
      const res = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grupo,
          // El recorte inteligente pasa aquí: el envío nunca supera ~1 MB
          // aunque el chat tenga años de historia.
          chat: muestrearChat(chat),
          mensajes: totalMensajes || undefined,
          idioma,
          contexto,
          nota,
          nombreUsuario,
          foto,
          telefono,
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
      router.push(`/r/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
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
          Esto toma unos minutos. No cierres esta página.
        </p>
      </div>
    );
  }

  const botonPrimario =
    "rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-ink";

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between text-sm text-muted">
        {paso > 1 ? (
          <button onClick={retroceder} aria-label="Volver" className="text-xl">
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
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
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
            ¿Algo que Beto deba saber?
          </h1>
          <p className="mt-2 text-muted">
            Cuéntale lo que ayude. Beto lo toma en serio: si le pides un
            enfoque, lo cumple.
          </p>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ej: somos amigos del colegio · quiero que hable de la época del viaje a Bocas · no seas tan duro con mi mamá"
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
                className="text-sm text-muted underline transition-colors hover:text-accent"
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
              className="w-full rounded-md border border-line bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              disabled={!!archivo}
            />
          </div>
          <p className="mt-4 text-xs text-muted">
            🔒 Tu chat no se guarda: se procesa una sola vez para escribir el
            reporte y se descarta. Nunca se usa para entrenar ningún modelo.
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
            Dinos cuál eres tú — pa&rsquo; que Beto no te perdone nada — y
            confirma el nombre del grupo.
          </p>
          {participantes.length >= 2 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {participantes.slice(0, 8).map((p) => (
                <button
                  key={p.nombre}
                  onClick={() => setNombreUsuario(p.nombre)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
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
            Ponle una foto al reporte
          </h1>
          <p className="mt-2 text-muted">
            Una foto del grupo lo hace sentir de colección. Es opcional — Beto
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
              className="mt-3 text-sm text-muted underline transition-colors hover:text-accent"
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
          <button
            onClick={enviar}
            className={`${botonPrimario} mt-8 w-full bg-accent`}
          >
            Que Beto lo lea →
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            Sin cuenta y sin tarjeta. En unos minutos Beto te da su veredicto.
          </p>
        </section>
      )}
    </div>
  );
}
