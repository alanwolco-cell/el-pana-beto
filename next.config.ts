import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cabeceras de seguridad para todo el sitio. nosniff evita que el navegador
  // adivine el tipo de un archivo, SAMEORIGIN impide que nos metan en un iframe
  // ajeno (clickjacking) y la politica de referer deja de filtrar la ruta exacta
  // a sitios de terceros.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
