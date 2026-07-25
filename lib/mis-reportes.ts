// Historial de reportes guardado en el navegador del usuario (localStorage).
// Sin cuenta, sin login, sin pedir nada. Vive solo en su dispositivo.

export type ReporteLocal = {
  id: string;
  grupo: string;
  fecha: string; // ISO
};

const CLAVE = "elpanabeto:reportes";

export function guardarReporteLocal(id: string, grupo: string): void {
  if (typeof window === "undefined") return;
  try {
    const previos = listarReportesLocales().filter((r) => r.id !== id);
    const nuevo: ReporteLocal = {
      id,
      grupo: grupo || "Sin nombre",
      fecha: new Date().toISOString(),
    };
    const lista = [nuevo, ...previos].slice(0, 100);
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    // localStorage lleno o bloqueado: no pasa nada, es opcional.
  }
}

export function listarReportesLocales(): ReporteLocal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return [];
    const lista = JSON.parse(raw);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function borrarReporteLocal(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const lista = listarReportesLocales().filter((r) => r.id !== id);
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    // ignorar
  }
}
