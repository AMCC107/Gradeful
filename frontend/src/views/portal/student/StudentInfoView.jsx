import { User, Mail, Phone, MapPin, Calendar, GraduationCap, ShieldCheck, Heart } from 'lucide-react';

const ICON_MAP = {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Heart,
};

/**
 * @param {object} props
 * @param {{ name?: string, initials?: string, statusLabel?: string, programLabel?: string }} [props.profile]
 * @param {{ label: string, value: string, icon?: string }[]} [props.personalInfo]
 * @param {{ label: string, value: string, icon?: string }[]} [props.academicInfo]
 */
function StudentInfoView({
  profile = {},
  personalInfo = [],
  academicInfo = [],
}) {
  const {
    name = '',
    initials = '—',
    statusLabel = 'Estudiante',
    programLabel = '',
  } = profile;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:p-8">
        <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-bold text-white shadow-md shadow-indigo-500/20">
          {initials}
        </div>
        <div className="space-y-1 text-center md:text-left">
          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {statusLabel}
          </span>
          <h1 className="pt-1 text-2xl font-bold text-slate-900">{name || 'Sin nombre'}</h1>
          {programLabel && <p className="text-sm text-slate-500">{programLabel}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <User className="size-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Datos Personales</h2>
          </div>
          <div className="space-y-4">
            {personalInfo.length === 0 && (
              <p className="text-sm text-slate-500">Sin datos personales disponibles.</p>
            )}
            {personalInfo.map((info) => {
              const IconComp = ICON_MAP[info.icon] ?? User;
              return (
                <div key={info.label} className="flex items-start gap-4">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                    <IconComp className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{info.label}</p>
                    <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-800">{info.value || '—'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <GraduationCap className="size-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Perfil Académico</h2>
          </div>
          <div className="space-y-4">
            {academicInfo.length === 0 && (
              <p className="text-sm text-slate-500">Sin datos académicos disponibles.</p>
            )}
            {academicInfo.map((info) => {
              const IconComp = ICON_MAP[info.icon] ?? GraduationCap;
              return (
                <div key={info.label} className="flex items-start gap-4">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                    <IconComp className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{info.label}</p>
                    <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-800">{info.value || '—'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentInfoView;
