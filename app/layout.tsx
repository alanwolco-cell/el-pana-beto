import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { HeaderMenu } from "./header-menu";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://elpanabeto.com"),
  title: {
    default:
      "El Pana Beto — La IA que se lee tu chat de WhatsApp y te dice las verdades",
    template: "%s · El Pana Beto",
  },
  description:
    "Sube el chat del grupo y Beto te escribe un reporte sin filtro: apodos, premios, red flags, ranking de aura y las frases que nadie quería que quedaran guardadas. Sin cuenta y sin tarjeta, en menos de un minuto.",
  openGraph: {
    type: "website",
    url: "https://elpanabeto.com",
    title: "El Pana Beto — La IA que se lee el chat del grupo y suelta las verdades",
    description:
      "Apodos, premios, red flags y el ranking de aura de cada quien. Sin cuenta y sin tarjeta: en menos de un minuto Beto opina de tu grupo.",
    locale: "es_PA",
    siteName: "El Pana Beto",
  },
  twitter: {
    card: "summary_large_image",
    title: "El Pana Beto — La IA que se lee el chat del grupo y suelta las verdades",
    description:
      "Apodos, premios, red flags y el ranking de aura de cada quien. Sin cuenta y sin tarjeta: en menos de un minuto Beto opina de tu grupo.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${fraunces.variable} ${inter.variable}`}>
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3 sm:py-4">
            <Link
              href="/"
              className="font-display flex items-center gap-2 text-lg font-semibold tracking-tight sm:gap-2.5 sm:text-xl"
            >
              <Image
                src="/beto.jpg"
                alt=""
                width={34}
                height={34}
                className="h-8 w-8 shrink-0 rounded-full border border-line object-cover sm:h-[34px] sm:w-[34px]"
              />
              <span className="whitespace-nowrap">
                El Pana Beto<span className="text-accent">.</span>
              </span>
            </Link>
            <HeaderMenu />
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
                  href="/mis-reportes"
                  className="underline transition-colors hover:text-accent"
                >
                  Mis reportes
                </Link>{" "}
                ·{" "}
                <Link
                  href="/privacidad"
                  className="underline transition-colors hover:text-accent"
                >
                  Privacidad
                </Link>{" "}
                ·{" "}
                <Link
                  href="/terminos"
                  className="underline transition-colors hover:text-accent"
                >
                  Términos
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
