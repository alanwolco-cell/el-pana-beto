import { ImageResponse } from "next/og";
import { aperturaDeMd, tituloDeMd } from "@/lib/reporte-md";
import { leerReporte } from "@/lib/storage";

export const dynamic = "force-dynamic";

const ANCHO = 1080;
const ALTO = 1920;

// Paleta del sitio (globals.css)
const PAPEL = "#f7f3ec";
const TINTA = "#191613";
const ACENTO = "#b4432f";
const MUTED = "#6f6659";
const LINEA = "#e3dcd0";
const CARTA = "#fffdf9";
const VERDE = "#15803d";

function recortar(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max);
  const ultimoEspacio = corte.lastIndexOf(" ");
  return `${corte.slice(0, ultimoEspacio > max * 0.6 ? ultimoEspacio : max)}…`;
}

// Satori no soporta woff2; el CSS de Google Fonts sin User-Agent devuelve TTF.
async function fuenteGoogle(
  familia: string,
  peso: number,
): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familia)}:wght@${peso}`,
      { cache: "force-cache" },
    ).then((r) => (r.ok ? r.text() : ""));
    const m = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!m) return null;
    const res = await fetch(m[1], { cache: "force-cache" });
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

let fuentesCache:
  | Promise<
      { name: string; data: ArrayBuffer; weight: 400 | 600; style: "normal" }[]
    >
  | undefined;

function cargarFuentes() {
  fuentesCache ??= Promise.all([
    fuenteGoogle("Fraunces", 600),
    fuenteGoogle("Inter", 400),
    fuenteGoogle("Inter", 600),
  ]).then(([fraunces, inter, interBold]) => {
    const fuentes: {
      name: string;
      data: ArrayBuffer;
      weight: 400 | 600;
      style: "normal";
    }[] = [];
    if (fraunces)
      fuentes.push({ name: "Fraunces", data: fraunces, weight: 600, style: "normal" });
    if (inter)
      fuentes.push({ name: "Inter", data: inter, weight: 400, style: "normal" });
    if (interBold)
      fuentes.push({ name: "Inter", data: interBold, weight: 600, style: "normal" });
    return fuentes;
  });
  return fuentesCache;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guardado = await leerReporte(id);
  if (
    !guardado ||
    (!guardado.reporte && !guardado.reporte2 && !guardado.reporteMd)
  ) {
    return new Response("Reporte no encontrado", { status: 404 });
  }

  // La tarjeta funciona con ambos formatos: v2 se mapea al shape mínimo usado.
  const v2 = guardado.reporte2;
  type MiniReporte = {
    titulo: string;
    veredicto: string;
    aura?: { nombre: string; puntos: number; motivo: string }[];
    perfiles: { nombre: string; apodo: string; descripcion: string }[];
    premios?: { premio: string; ganador: string; motivo: string }[];
  };
  const md = guardado.reporteMd;
  const r: MiniReporte = md
    ? {
        titulo: tituloDeMd(md),
        veredicto: aperturaDeMd(md).replace(/\*\*/g, "").replace(/^>\s?/gm, "").split("\n")[0] ?? "",
        aura: [],
        perfiles: [],
        premios: [],
      }
    : guardado.reporte ?? {
    titulo: v2!.titulo,
    veredicto: v2!.apertura.replace(/\*\*/g, "").split("\n")[0] ?? "",
    aura: [],
    perfiles: v2!.perfiles.map((p) => ({
      nombre: p.nombre,
      apodo: p.apodo ?? "",
      descripcion: p.cuerpo,
    })),
    premios: v2!.premios,
  };
  const [fuentes, fotoBeto] = await Promise.all([
    cargarFuentes(),
    fetch(new URL("/beto.jpg", req.url))
      .then((res) => (res.ok ? res.arrayBuffer() : null))
      .catch(() => null),
  ]);

  const titulo = recortar(r.titulo, 100);
  const veredicto = recortar(r.veredicto, 220);
  const grupo = recortar(guardado.grupo, 38);

  const auraTop = r.aura?.[0];
  const apodoTop = auraTop
    ? r.perfiles.find((p) => p.nombre === auraTop.nombre)?.apodo
    : undefined;
  const premioTop = r.premios?.[0];

  const serif = fuentes.some((f) => f.name === "Fraunces")
    ? "Fraunces"
    : "serif";
  const sans = fuentes.some((f) => f.name === "Inter") ? "Inter" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: PAPEL,
          padding: "48px",
          fontFamily: sans,
          color: TINTA,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: `3px solid ${TINTA}`,
            borderRadius: "36px",
            padding: "64px",
            backgroundColor: PAPEL,
          }}
        >
          {/* Cabecera */}
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            {fotoBeto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                // @ts-expect-error — satori acepta ArrayBuffer como src
                src={fotoBeto}
                width={110}
                height={110}
                alt=""
                style={{
                  borderRadius: "999px",
                  border: `3px solid ${LINEA}`,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "110px",
                  height: "110px",
                  borderRadius: "999px",
                  backgroundColor: ACENTO,
                  color: PAPEL,
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: serif,
                  fontSize: "56px",
                  fontWeight: 600,
                }}
              >
                B
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 600,
                  letterSpacing: "8px",
                  color: ACENTO,
                }}
              >
                EL PANA BETO
              </div>
              <div style={{ fontSize: "28px", color: MUTED, marginTop: "6px" }}>
                Beto se leyó todo el bochinche
              </div>
            </div>
          </div>

          {/* Cuerpo */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              justifyContent: "center",
              gap: "48px",
              marginTop: "48px",
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                backgroundColor: TINTA,
                color: PAPEL,
                borderRadius: "999px",
                padding: "14px 34px",
                fontSize: "30px",
                fontWeight: 600,
              }}
            >
              {grupo}
            </div>

            <div
              style={{
                fontFamily: serif,
                fontSize: titulo.length > 60 ? "62px" : "72px",
                fontWeight: 600,
                lineHeight: 1.12,
                letterSpacing: "-1px",
              }}
            >
              {titulo}
            </div>

            <div
              style={{
                display: "flex",
                borderLeft: `8px solid ${ACENTO}`,
                paddingLeft: "36px",
                fontSize: "36px",
                lineHeight: 1.5,
                color: MUTED,
              }}
            >
              {`“${veredicto}”`}
            </div>

            {auraTop ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: CARTA,
                  border: `2px solid ${LINEA}`,
                  borderRadius: "28px",
                  padding: "40px 44px",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 600,
                    letterSpacing: "5px",
                    color: ACENTO,
                  }}
                >
                  N.º 1 EN AURA
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: "24px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: serif,
                      fontSize: "48px",
                      fontWeight: 600,
                    }}
                  >
                    {recortar(auraTop.nombre, 24)}
                  </div>
                  <div
                    style={{
                      fontSize: "38px",
                      fontWeight: 600,
                      color: auraTop.puntos < 0 ? ACENTO : VERDE,
                    }}
                  >
                    {`${auraTop.puntos >= 0 ? "+" : "−"}${Math.abs(
                      auraTop.puntos,
                    ).toLocaleString("es-PA")} aura`}
                  </div>
                </div>
                {apodoTop && (
                  <div
                    style={{
                      fontSize: "34px",
                      fontStyle: "italic",
                      color: ACENTO,
                    }}
                  >
                    {`“${recortar(apodoTop, 60)}”`}
                  </div>
                )}
              </div>
            ) : premioTop ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: CARTA,
                  border: `2px solid ${LINEA}`,
                  borderRadius: "28px",
                  padding: "40px 44px",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 600,
                    letterSpacing: "5px",
                    color: ACENTO,
                  }}
                >
                  PREMIO DESTACADO
                </div>
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: "44px",
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {recortar(premioTop.premio, 60)}
                </div>
                <div style={{ fontSize: "34px", color: ACENTO, fontWeight: 600 }}>
                  {recortar(premioTop.ganador, 40)}
                </div>
              </div>
            ) : null}
          </div>

          {/* Pie */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              borderTop: `2px solid ${LINEA}`,
              paddingTop: "36px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: serif,
                fontSize: "36px",
                fontWeight: 600,
              }}
            >
              El Pana Beto<div style={{ color: ACENTO }}>.</div>
            </div>
            <div style={{ fontSize: "30px", fontWeight: 600, color: ACENTO }}>
              elpanabeto.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: ANCHO,
      height: ALTO,
      fonts: fuentes.length > 0 ? fuentes : undefined,
    },
  );
}
