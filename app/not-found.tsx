import Image from "next/image";
import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
      <Image
        src="/beto.jpg"
        alt="Beto"
        width={88}
        height={88}
        className="rounded-full border border-line object-cover"
      />
      <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Error 404
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">
        Este link no existe, pana.
      </h1>
      <p className="mt-4 leading-relaxed text-muted">
        Beto se lee todo — y esto no aparece por ningún lado. Revisa que el
        link esté completo, o dile al que te lo mandó que deje de recortar las
        cosas… como recorta los cuentos.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-accent px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-0.5"
      >
        Volver donde Beto
      </Link>
    </div>
  );
}
