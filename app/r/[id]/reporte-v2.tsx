import type { ReporteV2 } from "@/lib/schema";
import { Predicciones } from "./predicciones";

// ── Renderizado del formato v2 (clon Brandon): documento que fluye, con las
// citas del chat como burbujas verdes estilo WhatsApp. ────────────────────────

// Negritas simples: **texto** → <strong>.
function ConNegritas({ texto }: { texto: string }) {
  const partes = texto.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-ink">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

// Burbuja verde estilo WhatsApp para citas textuales del chat.
export function Burbuja({
  texto,
  autor,
}: {
  texto: string;
  autor?: string;
}) {
  return (
    <div className="my-3 flex">
      <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-[#d9fdd3] px-4 py-2.5 shadow-card">
        {autor && (
          <p className="mb-0.5 text-xs font-semibold text-[#1fa855]">{autor}</p>
        )}
        <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-[#111b21]">
          {texto}
        </p>
      </div>
    </div>
  );
}

// Prosa v2: párrafos separados por línea en blanco; líneas "> " → burbujas.
export function ProsaV2({
  texto,
  claseParrafo = "leading-relaxed text-ink-soft",
}: {
  texto: string;
  claseParrafo?: string;
}) {
  const bloques: { tipo: "p" | "cita"; texto: string }[] = [];
  for (const lineaCruda of texto.split("\n")) {
    const linea = lineaCruda.trimEnd();
    if (!linea.trim()) continue;
    if (/^>\s?/.test(linea.trim())) {
      const cita = linea.trim().replace(/^>\s?/, "");
      const ultimo = bloques[bloques.length - 1];
      if (ultimo && ultimo.tipo === "cita") {
        ultimo.texto += "\n" + cita;
      } else {
        bloques.push({ tipo: "cita", texto: cita });
      }
    } else {
      bloques.push({ tipo: "p", texto: linea.trim() });
    }
  }
  return (
    <div className="space-y-4">
      {bloques.map((b, i) =>
        b.tipo === "cita" ? (
          <Burbuja key={i} texto={b.texto} />
        ) : (
          <p key={i} className={claseParrafo}>
            <ConNegritas texto={b.texto} />
          </p>
        ),
      )}
    </div>
  );
}

function TituloSeccion({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display mt-14 text-2xl font-semibold leading-snug tracking-tight sm:text-[1.75rem]">
      {children}
    </h2>
  );
}

// Un perfil v2: nombre en negrita + apodo + prosa con burbujas.
function PerfilV2({
  nombre,
  apodo,
  cuerpo,
}: {
  nombre: string;
  apodo?: string;
  cuerpo: string;
}) {
  return (
    <div className="mt-8">
      <h3 className="font-display text-xl font-semibold">
        {nombre}
        {apodo ? (
          <span className="ml-2 text-base italic text-accent">({apodo})</span>
        ) : null}
      </h3>
      <div className="mt-2">
        <ProsaV2 texto={cuerpo} />
      </div>
    </div>
  );
}

// El documento completo (versión desbloqueada).
export function ReporteV2Completo({
  r,
  grupo,
}: {
  r: ReporteV2;
  grupo: string;
}) {
  return (
    <>
      {/* Apertura */}
      <div className="mt-10 text-lg leading-8 sm:text-[1.13rem] sm:leading-9">
        <ProsaV2
          texto={r.apertura}
          claseParrafo="leading-8 text-ink-soft sm:leading-9"
        />
      </div>

      {/* Secciones a la medida del grupo (el arma secreta del formato) */}
      {r.secciones?.map((s) => (
        <div key={s.titulo}>
          <TituloSeccion>
            {s.emoji} {s.titulo}
          </TituloSeccion>
          <div className="mt-4">
            <ProsaV2 texto={s.cuerpo} />
          </div>
        </div>
      ))}

      {/* Compatibilidad con los primeros reportes v2 (tema fijo) */}
      {!r.secciones?.length && r.temaTitulo && r.tema && (
        <>
          <TituloSeccion>🐐 {r.temaTitulo}</TituloSeccion>
          <div className="mt-4">
            <ProsaV2 texto={r.tema} />
          </div>
        </>
      )}

      {/* Perfiles */}
      <TituloSeccion>👤 Los perfiles: quién es quién en este manicomio</TituloSeccion>
      {r.perfiles.map((p) => (
        <PerfilV2 key={p.nombre} nombre={p.nombre} apodo={p.apodo} cuerpo={p.cuerpo} />
      ))}

      {/* Tolerados */}
      {r.tolerados && r.tolerados.length > 0 && (
        <>
          <TituloSeccion>🎭 Los que nadie menciona pero todos toleran</TituloSeccion>
          {r.tolerados.map((t) => (
            <div key={t.nombre} className="mt-6">
              <h3 className="font-display text-lg font-semibold">{t.nombre}</h3>
              <div className="mt-1.5">
                <ProsaV2 texto={t.cuerpo} />
              </div>
            </div>
          ))}
        </>
      )}

      {/* Premios */}
      {r.premios.length > 0 && (
        <>
          <TituloSeccion>🏆 Los Premios {grupo || "del grupo"}</TituloSeccion>
          <ul className="mt-4 space-y-4">
            {r.premios.map((p) => (
              <li key={p.premio} className="border-b border-line pb-4 last:border-0">
                <p className="font-medium">
                  {p.premio} —{" "}
                  <span className="font-display italic text-accent">{p.ganador}</span>
                </p>
                <p className="mt-1 leading-relaxed text-muted">{p.motivo}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Vocabulario */}
      {r.vocabulario.length > 0 && (
        <>
          <TituloSeccion>🗣️ El vocabulario que nadie afuera entiende</TituloSeccion>
          <dl className="mt-4 space-y-4">
            {r.vocabulario.map((v) => (
              <div key={v.termino} className="border-b border-line pb-4 last:border-0">
                <dt className="font-display text-lg font-semibold">“{v.termino}”</dt>
                <dd className="mt-1 leading-relaxed text-muted">{v.definicion}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {/* Flags */}
      <TituloSeccion>🚩 Green flags y red flags</TituloSeccion>
      <div className="mt-4 space-y-5">
        <div className="rounded-xl border-l-4 border-verde bg-verde/[0.05] p-5">
          <ProsaV2 texto={r.greenFlags} />
        </div>
        <div className="rounded-xl border-l-4 border-accent bg-accent/[0.05] p-5">
          <ProsaV2 texto={r.redFlags} />
        </div>
      </div>

      {/* La línea más loca */}
      <TituloSeccion>🤯 La línea más loca del chat</TituloSeccion>
      <div className="mt-4">
        <Burbuja texto={r.lineaMasLoca.cita} autor={r.lineaMasLoca.autor} />
        <p className="mt-3 leading-relaxed text-ink-soft">
          <ConNegritas texto={r.lineaMasLoca.comentario} />
        </p>
      </div>

      {/* Predicciones */}
      {r.predicciones.length > 0 && (
        <>
          <TituloSeccion>🔮 Predicción: cómo van a reaccionar a este reporte</TituloSeccion>
          <div className="mt-4">
            <Predicciones items={r.predicciones} />
          </div>
        </>
      )}

      {/* Cierre */}
      <div className="mt-14 border-t border-line pt-8 text-lg leading-8">
        <ProsaV2
          texto={r.cierre}
          claseParrafo="font-display leading-8 text-ink sm:text-[1.15rem]"
        />
      </div>
    </>
  );
}
