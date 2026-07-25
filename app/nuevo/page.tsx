"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  analizarChat,
  nombreGrupoDesdeArchivo,
  type Participante,
} from "@/lib/parse-chat";

const TOTAL_PASOS = 7;

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
  const [origen, setOrigen] = useState<"WhatsApp" | "iMessage">("WhatsApp");
  const [chat, setChat] = useState("");
  const [archivo, setArchivo] = useState("");
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [totalMensajes, setTotalMensajes] = useState(0);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [grupo, setGrupo] = useState("");
  const [tipo, setTipo] = useState<"clasico" | "profundo">("clasico");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajeIdx, setMensajeIdx] = useState(0);
  const inputArchivo = useRef<HTMLInputElement>(null);

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
          tipo,
          chat,
          idioma,
          contexto,
          nota,
          nombreUsuario,
        }),
      });
      const data = await res.json();
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
            ¿De dónde sale tu chat?
          </h1>
          <div className="mt-6 space-y-3">
            {(["WhatsApp", "iMessage"] as const).map((o) => (
              <button
                key={o}
                onClick={() => {
                  setOrigen(o);
                  avanzar();
                }}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  origen === o
                    ? "border-accent bg-card"
                    : "border-line hover:border-muted"
                }`}
              >
                <span className="block font-medium">{o}</span>
                <span className="block text-sm text-muted">
                  {o === "WhatsApp"
                    ? "Exporta el chat directo desde la app."
                    : "Copia la conversación desde tu Mac o iPhone."}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {paso === 5 && (
        <section className="mt-10">
          <h1 className="font-display text-3xl font-semibold">
            Exporta y sube tu conversación
          </h1>
          {origen === "WhatsApp" ? (
            <ol className="mt-6 space-y-2 text-muted">
              <li>1. Abre el chat y toca el nombre del grupo.</li>
              <li>2. Baja hasta «Exportar chat».</li>
              <li>3. Elige «Sin archivos».</li>
              <li>4. Guárdalo y sube aquí el .txt que te genera.</li>
            </ol>
          ) : (
            <ol className="mt-6 space-y-2 text-muted">
              <li>1. Abre la conversación en Mensajes.</li>
              <li>2. Selecciona y copia los mensajes (Cmd+A, Cmd+C en Mac).</li>
              <li>3. Pégalos acá abajo. Así de simple.</li>
            </ol>
          )}
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => inputArchivo.current?.click()}
              className="w-full rounded-md border border-dashed border-muted px-4 py-8 text-center text-sm text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {archivo
                ? `✓ Archivo cargado: ${archivo}`
                : "Subir el archivo exportado (.txt)"}
            </button>
            <input
              ref={inputArchivo}
              type="file"
              accept=".txt,text/plain"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) procesarTexto(await f.text(), f.name);
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
              : "Cuéntanos del grupo"}
          </h1>
          {participantes.length >= 2 && (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted">
                {totalMensajes.toLocaleString("es-PA")} mensajes de{" "}
                {participantes.length} personas.
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
          )}
          <div className="mt-8">
            <label className="block text-sm font-medium">
              ¿Cuál eres tú? (para que Beto no te perdone nada)
            </label>
            {participantes.length >= 2 && (
              <div className="mt-2 flex flex-wrap gap-2">
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
              className="mt-3 w-full rounded-md border border-line bg-card px-4 py-3 outline-none transition-colors focus:border-accent"
            />
          </div>
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

      {paso === 7 && (
        <section className="mt-10">
          <h1 className="font-display text-3xl font-semibold">
            ¿Cuál reporte quieres?
          </h1>
          <div className="mt-6 space-y-3">
            {(
              [
                [
                  "clasico",
                  "Reporte Clásico",
                  "$9.99",
                  "Humor al frente, verdades bien puestas. El que empezó todo.",
                  "El más pedido",
                ],
                [
                  "profundo",
                  "Reporte Profundo",
                  "$14.99",
                  "Menos chiste, más verdad. Las dinámicas que nadie nombra.",
                  "Para valientes",
                ],
              ] as const
            ).map(([valor, nombre, precio, desc, tag]) => (
              <button
                key={valor}
                onClick={() => setTipo(valor)}
                className={`w-full rounded-lg border p-5 text-left transition-colors ${
                  tipo === valor
                    ? "border-accent bg-card"
                    : "border-line hover:border-muted"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-lg font-semibold">
                    {nombre}
                  </span>
                  <span className="font-medium">{precio}</span>
                </div>
                <p className="mt-1 text-xs font-medium uppercase tracking-widest text-accent">
                  {tag}
                </p>
                <p className="mt-2 text-sm text-muted">{desc}</p>
              </button>
            ))}
            <div className="w-full rounded-lg border border-line p-5 text-left opacity-60">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg font-semibold">
                  El Espejo
                </span>
                <span className="text-sm text-muted">Próximamente</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                Varios chats tuyos comparados: cómo cambias según con quién
                hablas.
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted">
            Generarlo es <span className="font-medium text-ink">gratis</span>:
            ves el adelanto con el veredicto de Beto y pagas solo si quieren
            desbloquear el reporte completo. Pueden hacer la vaca.
          </p>
          {error && (
            <p className="mt-4 rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
              {error}
            </p>
          )}
          <button onClick={enviar} className={`${botonPrimario} mt-6 w-full bg-accent`}>
            Que Beto lo lea gratis →
          </button>
        </section>
      )}
    </div>
  );
}
