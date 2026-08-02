import { Download, FileText, GraduationCap, UserRound, Wallet, X } from 'lucide-react';

const TABS = [
  { id: 'info', label: 'Información', icon: UserRound },
  { id: 'academico', label: 'Historial Académico', icon: GraduationCap },
  { id: 'cuenta', label: 'Estado de Cuenta', icon: Wallet },
  { id: 'expediente', label: 'Expediente', icon: FileText },
];

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function fileMetaLabel(fileMeta) {
  if (!fileMeta?.name) return null;
  const sizeKb = fileMeta.size ? `${(fileMeta.size / 1024).toFixed(0)} KB` : '';
  return sizeKb ? `${fileMeta.name} · ${sizeKb}` : fileMeta.name;
}

function StudentProfile360({ open, student, profile, activeTab, onTabChange, onClose }) {
  if (!open || !student) return null;

  const fullName = profile
    ? [profile.nombre, profile.apellidos].filter(Boolean).join(' ')
    : student.nombre;

  const documents = [
    { key: 'acta', label: 'Acta de nacimiento', meta: profile?.documentos?.actaNacimiento },
    { key: 'foto', label: 'Foto de perfil', meta: profile?.documentos?.fotoPerfil },
    { key: 'domicilio', label: 'Comprobante de domicilio', meta: profile?.documentos?.comprobanteDomicilio },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-5 text-white">
          <div className="min-w-0">
            <p className="text-xs font-medium text-brand-100">Perfil 360 · Expediente del alumno</p>
            <h2 className="mt-1 truncate text-xl font-bold">{fullName || 'Alumno'}</h2>
            <p className="mt-0.5 text-sm text-brand-100">
              {student.matricula}
              {student.correo ? ` · ${student.correo}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 bg-slate-50/80 px-4 pt-3 sm:px-6">
          <div className="flex gap-1 overflow-x-auto pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={[
                    'inline-flex shrink-0 items-center gap-1.5 rounded-t-xl px-3.5 py-2.5 text-sm font-semibold transition',
                    active
                      ? '-mb-px border border-b-white border-slate-200 bg-white text-brand-700'
                      : 'border border-transparent text-slate-500 hover:bg-white/70 hover:text-slate-800',
                  ].join(' ')}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {activeTab === 'info' && (
            <div className="space-y-5">
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-900">Datos personales</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Nombre" value={profile?.nombre || student.nombre?.split(' ')[0]} />
                  <InfoRow label="Apellidos" value={profile?.apellidos} />
                  <InfoRow label="CURP" value={profile?.curp} />
                  <InfoRow label="Fecha de nacimiento" value={formatDate(profile?.fechaNacimiento)} />
                  <InfoRow label="Matrícula" value={student.matricula} />
                  <InfoRow label="Correo" value={student.correo} />
                  <div className="sm:col-span-2">
                    <InfoRow label="Dirección" value={profile?.direccion} />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-900">Datos médicos y tutor</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Tipo de sangre" value={profile?.tipoSangre} />
                  <InfoRow label="Teléfono de emergencia" value={profile?.telefonoEmergencia} />
                  <InfoRow label="Alergias" value={profile?.alergias || 'Ninguna registrada'} />
                  <InfoRow label="Nombre del tutor" value={profile?.tutorNombre} />
                </div>
              </div>
              {!profile && (
                <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Este alumno aún no tiene expediente completo del wizard. Completa una inscripción
                  nueva para capturar el perfil 360.
                </p>
              )}
            </div>
          )}

          {activeTab === 'academico' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <GraduationCap className="size-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Historial académico</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  Aquí se mostrarán las boletas y promedios por ciclo una vez conectado el módulo
                  académico.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {['Promedio general', 'Materias cursadas', 'Créditos'].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {label}
                    </p>
                    <div className="mt-2 h-7 w-16 animate-pulse rounded-md bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cuenta' && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                    Saldo estimado
                  </p>
                  <p className="mt-1 text-2xl font-bold text-amber-700">$0.00</p>
                  <p className="mt-1 text-xs text-amber-600/80">Placeholder · sin cargos vinculados</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Pagos vencidos
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">0</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Último pago
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">Sin registro</p>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-8 text-center text-sm text-slate-500">
                El detalle de cargos y pagos se conectará con Tesorería en una siguiente iteración.
              </div>
            </div>
          )}

          {activeTab === 'expediente' && (
            <div className="space-y-3">
              {documents.map((doc) => {
                const label = fileMetaLabel(doc.meta);
                const hasFile = Boolean(label);
                return (
                  <div
                    key={doc.key}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{doc.label}</p>
                        <p className="truncate text-xs text-slate-500">
                          {hasFile ? label : 'Documento pendiente'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!hasFile}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Download className="size-3.5" />
                      Descargar / Ver
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentProfile360;
