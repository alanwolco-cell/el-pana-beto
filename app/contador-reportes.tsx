import { leerContador } from "@/lib/contador";

// Prueba social: "Beto ya leyó +X,XXX chats". Server Component: lee el
// contador en el servidor y no renderiza nada si el número no da confianza.
export default async function ContadorReportes() {
  const total = await leerContador();
  if (total < 100) return null;
  const formateado = new Intl.NumberFormat("es-PA").format(total);
  return (
    <p className="text-sm text-muted">
      <span aria-hidden>📖</span> Beto ya leyó{" "}
      <span className="font-display font-semibold text-accent">
        +{formateado}
      </span>{" "}
      chats
    </p>
  );
}
