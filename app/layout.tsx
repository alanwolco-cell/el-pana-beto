import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "El Pana Beto — La IA que lee tu chat y te dice las verdades",
  description:
    "Pásale cualquier chat de WhatsApp. Beto se lee todo y te escribe un reporte con lo que de verdad piensa del grupo: apodos, premios, banderas y frases célebres.",
  openGraph: {
    title: "El Pana Beto — Reportes de tu chat de grupo",
    description:
      "Beto se lee todo tu chat y te dice las cosas como son.",
    locale: "es_PA",
    siteName: "El Pana Beto",
    images: [{ url: "/beto.jpg", width: 900, height: 900, alt: "Beto" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${fraunces.variable} ${inter.variable}`}>
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="font-display flex items-center gap-2.5 text-xl font-semibold tracking-tight"
            >
              <Image
                src="/beto.jpg"
                alt=""
                width={34}
                height={34}
                className="rounded-full border border-line object-cover"
              />
              El Pana Beto<span className="text-accent">.</span>
            </Link>
            <Link
              href="/nuevo"
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent"
            >
              Pedir mi reporte
            </Link>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 text-sm text-muted">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 El Pana Beto. Todos los derechos reservados.</p>
              <p>
                Tu chat no se guarda: se procesa una vez y se descarta.{" "}
                <Link
                  href="/privacidad"
                  className="underline transition-colors hover:text-accent"
                >
                  Política de Privacidad
                </Link>{" "}
                · Ley 81 de 2019 (Panamá).
              </p>
            </div>
            <p>
              Soporte, quejas y bochinche:{" "}
              <a
                href="mailto:elpanabeto.com@gmail.com"
                className="underline transition-colors hover:text-accent"
              >
                elpanabeto.com@gmail.com
              </a>
              . Sí, con el .com adentro: compramos el dominio y de la emoción
              lo metimos hasta en el correo.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
