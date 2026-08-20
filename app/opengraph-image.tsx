import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "El Pana Beto · la IA que se lee tu chat de WhatsApp y te dice las cosas como son";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Paleta del sitio (globals.css)
const PAPEL = "#f7f3ec";
const TINTA = "#191613";
const ACENTO = "#b4432f";
const MUTED = "#6f6659";

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

export default async function OpengraphImage() {
  const [fraunces, inter, foto] = await Promise.all([
    fuenteGoogle("Fraunces", 600),
    fuenteGoogle("Inter", 600),
    readFile(join(process.cwd(), "public", "beto.jpg")).catch(() => null),
  ]);

  const fuentes: {
    name: string;
    data: ArrayBuffer;
    weight: 600;
    style: "normal";
  }[] = [];
  if (fraunces)
    fuentes.push({ name: "Fraunces", data: fraunces, weight: 600, style: "normal" });
  if (inter)
    fuentes.push({ name: "Inter", data: inter, weight: 600, style: "normal" });

  const serif = fraunces ? "Fraunces" : "serif";
  const sans = inter ? "Inter" : "sans-serif";
  const fotoSrc = foto
    ? `data:image/jpeg;base64,${foto.toString("base64")}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: PAPEL,
          padding: "36px",
          fontFamily: sans,
          color: TINTA,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            border: `3px solid ${TINTA}`,
            borderRadius: "28px",
            backgroundColor: PAPEL,
            padding: "52px 56px",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {/* Columna de texto */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              flexGrow: 1,
            }}
          >
            <div
              style={{
                fontSize: "26px",
                fontWeight: 600,
                letterSpacing: "7px",
                color: ACENTO,
              }}
            >
              EL PANA BETO
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "26px",
              }}
            >
              <div
                style={{
                  fontFamily: serif,
                  fontSize: "62px",
                  fontWeight: 600,
                  lineHeight: 1.1,
                  letterSpacing: "-1px",
                  maxWidth: "680px",
                }}
              >
                Se lee tu chat de WhatsApp y te dice las cosas como son.
              </div>
              <div
                style={{
                  fontSize: "28px",
                  lineHeight: 1.45,
                  color: MUTED,
                  maxWidth: "640px",
                }}
              >
                Apodos, premios, red flags y las frases que nadie quería
                que quedaran guardadas.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  backgroundColor: TINTA,
                  color: PAPEL,
                  borderRadius: "999px",
                  padding: "14px 28px",
                  fontSize: "24px",
                  fontWeight: 600,
                }}
              >
                Sin cuenta · Sin tarjeta · 1 minuto
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 600,
                  color: ACENTO,
                }}
              >
                elpanabeto.com
              </div>
            </div>
          </div>

          {/* Foto de Beto */}
          {fotoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoSrc}
              width={340}
              height={340}
              alt=""
              style={{
                borderRadius: "24px",
                border: `3px solid ${TINTA}`,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: "340px",
                height: "340px",
                borderRadius: "24px",
                backgroundColor: ACENTO,
                color: PAPEL,
                alignItems: "center",
                justifyContent: "center",
                fontFamily: serif,
                fontSize: "160px",
                fontWeight: 600,
                border: `3px solid ${TINTA}`,
                flexShrink: 0,
              }}
            >
              B
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fuentes.length > 0 ? fuentes : undefined,
    },
  );
}
