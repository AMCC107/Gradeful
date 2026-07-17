import { RefreshCw, UserPlus, UserMinus } from 'lucide-react';
import { useEnrollmentManagement } from '../../controllers/hooks/useEnrollmentManagement';
import {
  AdminPageHero,
  FeedbackBanner,
  FieldError,
  inputClass,
  inputErrorClass,
} from './shared/AdminUi';

function EnrollmentManagement() {
  const {
    groups,
    students,
    selectedGroupId,
    selectedStudentId,
    selectedGroup,
    enrolled,
    loading,
    loadingEnrolled,
    saving,
    error,
    success,
    fieldErrors,
    handlers,
  } = useEnrollmentManagement();

  const cuposDisponibles = selectedGroup?.cupos_disponibles ?? null;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Académico"
        title="Inscripciones"
        description="Inscribe alumnos a grupos validando el cupo restante en tiempo real."
      />

      <FeedbackBanner error={error} success={success} onDismiss={handlers.onDismissFeedback} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Nueva inscripción</h3>
          <button
            type="button"
            onClick={handlers.onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <form onSubmit={handlers.onEnroll} className="grid gap-4 md:grid-cols-2" noValidate>
          <div>
            <label htmlFor="enroll-group" className="mb-1.5 block text-sm font-medium text-slate-700">
              Grupo
            </label>
            <select
              id="enroll-group"
              value={selectedGroupId}
              onChange={(e) => handlers.onGroupChange(e.target.value)}
              className={fieldErrors.group_id ? inputErrorClass : inputClass}
              disabled={loading}
            >
              <option value="">Selecciona un grupo</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id} disabled={g.cupos_disponibles <= 0}>
                  #{g.id} · {g.subject_nombre} · {g.course_nombre} ({g.inscritos}/{g.capacidad_maxima})
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.group_id} />
            {selectedGroup && (
              <p className="mt-1.5 text-xs text-slate-500">
                Cupos disponibles:{' '}
                <span className={cuposDisponibles > 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
                  {cuposDisponibles}
                </span>
                {' '}de {selectedGroup.capacidad_maxima}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="enroll-student" className="mb-1.5 block text-sm font-medium text-slate-700">
              Alumno
            </label>
            <select
              id="enroll-student"
              value={selectedStudentId}
              onChange={(e) => handlers.onStudentChange(e.target.value)}
              className={fieldErrors.student_id ? inputErrorClass : inputClass}
              disabled={loading}
            >
              <option value="">Selecciona un alumno</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.matricula} — {s.nombre}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.student_id} />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving || loading || (cuposDisponibles !== null && cuposDisponibles <= 0)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <UserPlus className="size-4" />
              {saving ? 'Inscribiendo…' : 'Inscribir alumno'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Inscritos del grupo</h3>
          <p className="text-xs text-slate-500">
            {!selectedGroupId
              ? 'Selecciona un grupo para ver el listado.'
              : loadingEnrolled
                ? 'Cargando…'
                : `${enrolled.length} alumno${enrolled.length === 1 ? '' : 's'} inscrito${enrolled.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Matrícula</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Correo</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!selectedGroupId && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    Elige un grupo arriba para consultar inscritos.
                  </td>
                </tr>
              )}
              {selectedGroupId && loadingEnrolled && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    Cargando inscritos…
                  </td>
                </tr>
              )}
              {selectedGroupId && !loadingEnrolled && enrolled.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    Este grupo aún no tiene alumnos inscritos.
                  </td>
                </tr>
              )}
              {selectedGroupId &&
                !loadingEnrolled &&
                enrolled.map((row) => (
                  <tr key={row.enrollment_id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{row.matricula}</td>
                    <td className="px-5 py-3.5 text-slate-700">{row.nombre}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.correo}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{row.fecha_inscripcion}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handlers.onUnenroll(row.enrollment_id, row.nombre)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <UserMinus className="size-3.5" />
                          Quitar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentManagement;
