const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function horaLabel(n: number): string {
  const ap = n < 12 ? "a.m." : "p.m.";
  const h12 = n % 12 === 0 ? 12 : n % 12;
  return `${h12} ${ap}`;
}

type Stats = {
  porHora: number[];
  porDiaSemana: number[];
  horaPico: number;
  diaSemanaPico: number;
  diaRecord: { fecha: string; cantidad: number } | null;
  mesPico: { etiqueta: string; cantidad: number } | null;
  total: number;
};

export function EstadisticasGrupo({ stats }: { stats: Stats }) {
  const maxHora = Math.max(...stats.porHora, 1);
  const maxDia = Math.max(...stats.porDiaSemana, 1);

  return (
    <div className="space-y-8">
      {/* Datos destacados */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-card p-4 shadow-card">
          <p className="text-2xl">🌙</p>
          <p className="font-display mt-1 text-lg font-semibold text-accent">
            {horaLabel(stats.horaPico)}
          </p>
          <p className="text-xs text-muted">la hora del bochinche</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-4 shadow-card">
          <p className="text-2xl">📅</p>
          <p className="font-display mt-1 text-lg font-semibold text-accent">
            {["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"][stats.diaSemanaPico]}
          </p>
          <p className="text-xs text-muted">el día más activo</p>
        </div>
        {stats.mesPico && (
          <div className="rounded-xl border border-line bg-card p-4 shadow-card">
            <p className="text-2xl">🔥</p>
            <p className="font-display mt-1 text-base font-semibold capitalize text-accent">
              {stats.mesPico.etiqueta}
            </p>
            <p className="text-xs text-muted">el mes más caliente</p>
          </div>
        )}
        {stats.diaRecord && (
          <div className="rounded-xl border border-line bg-card p-4 shadow-card">
            <p className="text-2xl">💥</p>
            <p className="font-display mt-1 text-base font-semibold text-accent">
              {stats.diaRecord.cantidad.toLocaleString("es-PA")}
            </p>
            <p className="text-xs text-muted">
              en un día ({stats.diaRecord.fecha})
            </p>
          </div>
        )}
      </div>

      {/* A qué horas escriben */}
      <div>
        <p className="text-sm font-medium text-muted">
          A qué horas cobra vida el grupo
        </p>
        <div className="mt-3 flex items-end gap-[3px]" style={{ height: 90 }}>
          {stats.porHora.map((n, h) => (
            <div
              key={h}
              className="group relative flex-1"
              style={{ height: "100%" }}
            >
              <div className="flex h-full items-end">
                <div
                  className={`w-full rounded-t ${h === stats.horaPico ? "bg-accent" : "bg-ink/25"}`}
                  style={{ height: `${Math.max(3, (n / maxHora) * 100)}%` }}
                  title={`${horaLabel(h)}: ${n}`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>12 a.m.</span>
          <span>6 a.m.</span>
          <span>12 p.m.</span>
          <span>6 p.m.</span>
          <span>11 p.m.</span>
        </div>
      </div>

      {/* Qué días escriben */}
      <div>
        <p className="text-sm font-medium text-muted">
          Los días que no se callan
        </p>
        <div className="mt-3 space-y-2">
          {stats.porDiaSemana.map((n, d) => (
            <div key={d} className="flex items-center gap-3">
              <span
                className={`w-8 shrink-0 text-sm ${d === stats.diaSemanaPico ? "font-semibold text-accent" : "text-muted"}`}
              >
                {DIAS[d]}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full ${d === stats.diaSemanaPico ? "bg-accent" : "bg-ink/50"}`}
                  style={{ width: `${Math.max(2, (n / maxDia) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
