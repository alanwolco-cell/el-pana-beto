"use client";

import Link from "next/link";
import { useState } from "react";

export function HeaderMenu() {
  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="Menú"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-line transition-colors hover:border-muted"
      >
        <span className="block h-[2px] w-5 rounded bg-ink" />
        <span className="block h-[2px] w-5 rounded bg-ink" />
        <span className="block h-[2px] w-5 rounded bg-ink" />
      </button>

      {abierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={cerrar} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-card shadow-panel">
            <Link
              href="/mis-reportes"
              onClick={cerrar}
              className="block px-4 py-3 text-sm font-medium transition-colors hover:bg-paper"
            >
              Mis reportes
            </Link>
            <Link
              href="/nuevo"
              onClick={cerrar}
              className="block border-t border-line px-4 py-3 text-sm font-medium text-accent transition-colors hover:bg-paper"
            >
              Pedir mi reporte
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
