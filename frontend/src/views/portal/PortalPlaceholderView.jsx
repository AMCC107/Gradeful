import { useLocation } from 'react-router-dom';

const SEGMENT_LABELS = {
  resumen: 'Resumen',
  'mi-informacion': 'Mi Información',
  calificaciones: 'Calificaciones',
  pagos: 'Colegiatura y Pagos',
  tramites: 'Trámites',
  'gestion-alumnos': 'Gestión de Alumnos',
  'registro-notas': 'Registro de Notas',
  tesoreria: 'Tesorería y Pagos',
  configuracion: 'Configuración Global',
};

function PortalPlaceholderView() {
  const { pathname } = useLocation();
  const segment = pathname.split('/').at(-1);
  const label = SEGMENT_LABELS[segment] ?? 'Sección';

  return (
    <div className="flex flex-col gap-6">
      {/* Banner card */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-lg shadow-brand-600/20">
        <p className="text-sm font-medium text-brand-100 mb-1">Vista en construcción</p>
        <h2 className="text-2xl font-bold">{label}</h2>
        <p className="mt-1 text-sm text-brand-200">
          Este módulo estará disponible próximamente.
        </p>
      </div>

      {/* Skeleton cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 h-3 w-1/3 rounded-full bg-slate-100 animate-pulse" />
            <div className="space-y-2">
              <div className="h-2.5 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-2.5 w-5/6 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-2.5 w-4/6 rounded-full bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Wide skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 h-3 w-1/4 rounded-full bg-slate-100 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-8 shrink-0 rounded-full bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-2 w-2/3 rounded-full bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PortalPlaceholderView;
