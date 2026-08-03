import { useRef, useState } from 'react';
import { Eye, Pencil, UserMinus, UserPlus, RefreshCw, Search, Upload, X } from 'lucide-react';
import { useStudentManagement } from '../../controllers/hooks/useStudentManagement';
import { ExportButtons } from '../../components/ui';
import { exportStudentsExcel, exportStudentsPdf, importStudents } from '../../services/students.service';
import {
  AdminPageHero,
  FeedbackBanner,
  FieldError,
  inputClass,
  inputErrorClass,
} from './shared/AdminUi';
import StudentEnrollmentWizard from './StudentEnrollmentWizard';
import StudentProfile360 from './StudentProfile360';

function StudentEditModal({
  open,
  form,
  fieldErrors,
  eligibleUsers,
  saving,
  onClose,
  onChange,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Editar alumno</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Actualiza la vinculación de usuario y matrícula.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="student-user" className="mb-1.5 block text-sm font-medium text-slate-700">
              Usuario
            </label>
            <select
              id="student-user"
              value={form.user_id}
              onChange={(e) => onChange('user_id', e.target.value)}
              className={fieldErrors.user_id ? inputErrorClass : inputClass}
            >
              <option value="">Selecciona un usuario</option>
              {eligibleUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre} ({user.correo})
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.user_id} />
          </div>

          <div>
            <label htmlFor="student-matricula" className="mb-1.5 block text-sm font-medium text-slate-700">
              Matrícula
            </label>
            <input
              id="student-matricula"
              type="text"
              value={form.matricula}
              onChange={(e) => onChange('matricula', e.target.value)}
              className={fieldErrors.matricula ? inputErrorClass : inputClass}
              placeholder="EST-2026-001"
            />
            <FieldError message={fieldErrors.matricula} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudentManagement() {
  const {
    students,
    eligibleUsers,
    loading,
    saving,
    error,
    success,
    isWizardOpen,
    wizardStep,
    form,
    fieldErrors,
    filters,
    isEditModalOpen,
    editForm,
    viewingStudent,
    profileTab,
    viewingProfile,
    handlers,
  } = useStudentManagement();

  const importInputRef = useRef(null);
  const [transferFeedback, setTransferFeedback] = useState({ error: '', success: '' });
  const hasFilters = Boolean(filters.search || filters.status);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportChange = async (event) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    try {
      const result = await importStudents(file);
      setTransferFeedback({ error: '', success: `${result.message} ${result.summary.created} alumno(s) creado(s).` });
      await handlers.onRefresh();
    } catch (requestError) {
      setTransferFeedback({ error: requestError.message, success: '' });
    }
    event.target.value = '';
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Académico"
        title="Gestión de Alumnos"
        description="Inscribe alumnos con expediente completo (wizard) y consulta su perfil 360."
      />

      <FeedbackBanner
        error={error}
        success={success}
        onDismiss={handlers.onDismissFeedback}
      />
      <FeedbackBanner {...transferFeedback} onDismiss={() => setTransferFeedback({ error: '', success: '' })} />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Alumnos registrados</h3>
            <p className="text-xs text-slate-500">
              {loading ? 'Cargando…' : `${students.length} alumno${students.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ExportButtons
              onExportPDF={() => exportStudentsPdf().catch((requestError) => setTransferFeedback({ error: requestError.message, success: '' }))}
              onExportExcel={() => exportStudentsExcel().catch((requestError) => setTransferFeedback({ error: requestError.message, success: '' }))}
            />
            <button
              type="button"
              onClick={handleImportClick}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <Upload className="size-4" />
              Importar Alumnos (Excel)
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={handleImportChange}
            />
            <button
              type="button"
              onClick={handlers.onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={handlers.onOpenCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <UserPlus className="size-4" />
              Nuevo alumno
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => handlers.onFilterChange('search', e.target.value)}
              placeholder="Buscar por nombre, correo o matrícula…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => handlers.onFilterChange('status', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={handlers.onClearFilters}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Matrícula</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Correo</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Cargando alumnos…
                  </td>
                </tr>
              )}
              {!loading && students.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    {hasFilters
                      ? 'No hay alumnos que coincidan con los filtros.'
                      : 'No hay alumnos registrados.'}
                  </td>
                </tr>
              )}
              {!loading &&
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                    onClick={() => handlers.onOpenProfile(student)}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{student.id}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{student.matricula}</td>
                    <td className="px-5 py-3.5 text-slate-700">{student.nombre}</td>
                    <td className="px-5 py-3.5 text-slate-600">{student.correo}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={[
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          student.is_active
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
                        ].join(' ')}
                      >
                        {student.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlers.onOpenProfile(student)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="size-3.5" />
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => handlers.onOpenEdit(student)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="size-3.5" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handlers.onDeactivate(student)}
                          disabled={!student.is_active}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                        >
                          <UserMinus className="size-3.5" />
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <StudentEnrollmentWizard
        open={isWizardOpen}
        step={wizardStep}
        form={form}
        fieldErrors={fieldErrors}
        eligibleUsers={eligibleUsers}
        saving={saving}
        onClose={handlers.onCloseWizard}
        onChange={handlers.onFormChange}
        onNext={handlers.onNextStep}
        onBack={handlers.onBackStep}
        onFinish={handlers.onFinishWizard}
      />

      <StudentEditModal
        open={isEditModalOpen}
        form={editForm}
        fieldErrors={fieldErrors}
        eligibleUsers={eligibleUsers}
        saving={saving}
        onClose={handlers.onCloseEditModal}
        onChange={handlers.onEditFormChange}
        onSubmit={handlers.onEditSubmit}
      />

      <StudentProfile360
        open={Boolean(viewingStudent)}
        student={viewingStudent}
        profile={viewingProfile}
        activeTab={profileTab}
        onTabChange={handlers.onProfileTabChange}
        onClose={handlers.onCloseProfile}
      />
    </div>
  );
}

export default StudentManagement;
