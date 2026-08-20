"use client";

import { useEffect, useState } from "react";

const mensajes = [
  "Beto está abriendo el chat…",
  "Leyendo el bochinche completo…",
  "Beto encontró algo interesante…",
  "Tomando nota de los apodos…",
  "Beto se está riendo solo…",
  "Beto fue por un raspao, ya vuelve…",
  "Redactando el veredicto…",
  "Puliendo los red flags…",
];

export function GenerandoReporte({
  id,
  // creado ya no gobierna el auto-reintento (v2: estar aquí = pagado), pero
  // sigue llegando como prop por compatibilidad.
  creado: _creado,
  estimado = 60,
  waBeto,
  igBeto,
}: {
  id: string;
  creado?: string;
  // Estimado honesto en segundos, calculado según el tamaño real del chat.
  estimado?: number;
  // Número de WhatsApp de Beto (si está configurado): el usuario puede irse y
  // "reclamarle" el reporte por chat, como con una persona.
  waBeto?: string;
  // Usuario de Instagram de Beto (ej. "elpanabeto.co"): alternativa para
  // reclamar el reporte por DM. IG no permite pre-escribir el mensaje, así
  // que copiamos el link al portapapeles para que lo peguen.
  igBeto?: string;
}) {
  const [idx, setIdx] = useState(0);
  // "atascado" = el SERVIDOR agotó sus reintentos automáticos (rarísimo).
  // Nunca hay botón de reintentar: Beto se levanta solo; esto solo informa.
  const [atascado, setAtascado] = useState(false);
  const [seg, setSeg] = useState(0);
  const [reintentando, setReintentando] = useState(false);
  const [linkCopiadoIg, setLinkCopiadoIg] = useState(false);

  useEffect(() => {
    const rot = setInterval(() => setIdx((i) => (i + 1) % mensajes.length), 4000);
    return () => clearInterval(rot);
  }, []);

  useEffect(() => {
    // Tiempo REAL desde el reloj, no un contador: el navegador congela los
    // timers cuando la pestaña va a background y el contador se quedaba lento.
    // Recalculando contra Date.now(), al volver el tiempo salta a la realidad.
    const inicio = Date.now();
    const tick = () =>
      setSeg(Math.max(0, Math.floor((Date.now() - inicio) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    const alVolver = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, []);

  // Ya NO hay tope duro que muestre errores: el servidor se auto-retoma en
  // cadena (cortes de etapa + reintentos con backoff) y este poller sigue
  // preguntando. Si tarda, la barra lo dice honesto; si el servidor agota sus
  // reintentos, el estado llega como "error" terminal y ahí sí se informa;
  // en calma y sin pedirle nada al usuario.

  // Progreso que avanza hacia ~95% y se queda ahí hasta que de verdad termina.
  const progreso = Math.min(95, Math.round((seg / estimado) * 100));
  const faltan = Math.max(0, estimado - seg);

  useEffect(() => {
    let vivo = true;
    let ultimoRespaldo = 0;
    let autoIntentos = 0;
    const claveListo = `listo-${id}`;

    // Un "error" del server significa que YA agotó sus reintentos automáticos
    // (con backoff y degradación de modelo). Como último cartucho, el cliente
    // intenta un par de veces más en silencio; solo después informa, en
    // calma, sin botones y sin pedirle nada al usuario. (Estar aquí = pagado,
    // el gate del server frena los no pagados, así que reintentar es seguro.)
    function manejarError() {
      if (!vivo) return;
      if (autoIntentos < 2) {
        autoIntentos += 1;
        setReintentando(true);
        respaldo();
      } else {
        setAtascado(true);
      }
    }
    // Marca (por pestaña) que ya sabemos que el reporte quedó listo. Sirve para
    // que, tras el reload, NO se dispare otra generación mientras la lectura del
    // storage se pone al día (evita el bucle de regeneración que lo hacía tardar
    // minutos).
    const yaAvisado = () => {
      try {
        return sessionStorage.getItem(claveListo) === "1";
      } catch {
        return false;
      }
    };
    const recargarListo = () => {
      try {
        sessionStorage.setItem(claveListo, "1");
      } catch {}
      // Recarga a ?ready=<único>: el server, al ver ?ready, REINTENTA la lectura
      // (get de origen) hasta ~10s para pasar el lag de réplica de Blob, y
      // renderiza el reporte directo, sin poller en la página recargada, así no
      // se dispara el artefacto de Safari. Valor único fuerza la recarga.
      const u = new URL(window.location.href);
      u.searchParams.set("ready", String(Date.now()));
      window.location.replace(u.toString());
    };

    // Pide al server generar. Mantiene el fetch abierto hasta terminar (en
    // foreground completa como curl). El guard del server evita duplicar.
    async function respaldo() {
      ultimoRespaldo = Date.now();
      try {
        const r = await fetch("/api/reportes/generar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
          cache: "no-store",
        });
        const d = await r.json();
        if (!vivo) return;
        if (d.estado === "listo") {
          recargarListo();
          return;
        }
        if (d.estado === "error") {
          manejarError();
        }
        // "pendiente" = el registro del pago todavía no era visible para el
        // gate (lag de blob). No esperar los 130s completos: reintentar pronto.
        if (d.estado === "pendiente") {
          ultimoRespaldo = Date.now() - 105_000;
        }
      } catch {
        // si falla (background), el siguiente ciclo reintenta
      }
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let revisando = false;

    function programar(ms: number) {
      if (!vivo) return;
      clearTimeout(timer);
      timer = setTimeout(revisar, ms);
    }

    async function revisar() {
      if (revisando) return;
      revisando = true;
      try {
        // query único: evita que el navegador/edge devuelva un estado cacheado.
        const r = await fetch(`/api/reportes/estado?id=${id}&_=${Date.now()}`, {
          cache: "no-store",
        });
        const d = await r.json();
        if (!vivo) return;
        if (d.estado === "listo") {
          recargarListo();
          return;
        }
        if (d.estado === "error") {
          manejarError();
          return;
        }
        // Sigue "generando". La generación la corre el SERVER (waitUntil desde
        // el create). Este respaldo idempotente solo la retoma si aquella
        // corrida murió: el primer tick actúa de arranque de emergencia (el
        // guard del server responde "generando" al instante si ya hay una viva)
        // y después solo reintenta pasado el guard (~130s).
        if (!yaAvisado() && Date.now() - ultimoRespaldo > 130000) {
          respaldo();
        }
      } catch {
        // sin conexión momentánea: seguimos intentando
      } finally {
        revisando = false;
        programar(3000);
      }
    }

    // Al volver del background (iPhone bloqueado / cambio de app), los timers
    // vienen congelados: revisamos de una para no dejar al usuario esperando.
    const alVolver = () => {
      if (document.visibilityState === "visible") programar(0);
    };
    document.addEventListener("visibilitychange", alVolver);

    programar(1500);
    return () => {
      vivo = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [id]);

  if (atascado) {
    // Sin botones: el poller sigue vivo por detrás; si el servidor (o
    // nosotros a mano) lo rescata, esta pantalla se convierte sola en el
    // reporte. El usuario no tiene que hacer NADA.
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/beto.jpg"
          alt="Beto"
          className="h-20 w-20 rounded-full border border-line object-cover"
        />
        <h1 className="font-display mt-6 text-3xl font-semibold">
          Beto se atascó con este chat
        </h1>
        <p className="mt-4 text-muted">
          Pasa poquísimo, y ya quedó reportado de nuestro lado. Tu desbloqueo
          está guardado y este link es tuyo para siempre: vuelve en un rato y
          el reporte va a estar aquí. No tienes que pagar de nuevo ni hacer
          nada más.
        </p>
        <p className="mt-4 text-sm text-muted">
          ¿Mucha ansiedad? Escríbenos a{" "}
          <a href="mailto:elpanabeto.com@gmail.com" className="underline">
            elpanabeto.com@gmail.com
          </a>{" "}
          y lo resolvemos contigo.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/beto.jpg"
        alt="Beto"
        className="h-20 w-20 rounded-full border border-line object-cover"
      />
      <h1 className="font-display mt-8 text-3xl font-semibold">
        {reintentando
          ? "Beto se tropezó, pero ya lo está intentando de nuevo…"
          : mensajes[idx]}
      </h1>

      <div className="mt-8 w-full max-w-sm">
        <div className="h-2.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-all duration-1000 ease-linear"
            style={{ width: `${progreso}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted">
          {progreso < 95
            ? `${progreso}% · le faltan como ${faltan}s`
            : seg < estimado + 30
              ? "Ya casi… dándole los últimos toques"
              : "Se está tomando su tiempo con tanto material, sigue en eso, tranquilo"}
        </p>
      </div>

      <p className="mt-6 text-muted">
        Beto se está leyendo TODO el chat: esto toma unos minutos. Vete
        tranquilo: cuando vuelvas, tu reporte va a estar aquí (y queda guardado
        en Mis reportes).
      </p>

      {(waBeto || igBeto) && (
        <div className="mt-5 flex flex-col items-center gap-2.5">
          {waBeto && (
            <button
              onClick={() => {
                // El link se arma al click (evita desajustes de hidratación).
                const texto = `Qué xopá Beto 👀 ¿cómo va mi reporte? ${window.location.origin + window.location.pathname}`;
                window.open(
                  `https://wa.me/${waBeto.replace(/[^\d]/g, "")}?text=${encodeURIComponent(texto)}`,
                  "_blank",
                  "noopener",
                );
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-medium text-white shadow-boton transition-transform duration-200 ease-suave hover:-translate-y-0.5"
            >
              💬 Reclámale tu reporte a Beto
            </button>
          )}
          {igBeto && (
            <button
              onClick={async () => {
                // IG no permite pre-escribir el DM: copiamos el link para que
                // solo tengan que pegarlo y Beto sepa cuál reporte es.
                try {
                  await navigator.clipboard.writeText(
                    `Qué xopá Beto 👀 ¿cómo va mi reporte? ${window.location.origin + window.location.pathname}`,
                  );
                  setLinkCopiadoIg(true);
                } catch {}
                setTimeout(
                  () =>
                    window.open(
                      `https://ig.me/m/${igBeto.replace(/^@/, "")}`,
                      "_blank",
                      "noopener",
                    ),
                  400,
                );
              }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-5 py-3 font-medium text-white shadow-boton transition-transform duration-200 ease-suave hover:-translate-y-0.5"
            >
              📸 Reclámaselo por Instagram
            </button>
          )}
          {linkCopiadoIg && (
            <p className="text-xs text-muted">
              ✅ Link copiado, pégalo en el DM para que Beto sepa cuál es tu
              reporte.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
