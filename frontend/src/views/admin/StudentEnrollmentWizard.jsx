import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FileUpload } from '../../components/ui';
import { FieldError, inputClass, inputErrorClass } from './shared/AdminUi';

const STEPS = [
  { id: 1, label: 'Datos personales' },
  { id: 2, label: 'Médicos y tutor' },
  { id: 3, label: 'Documentos' },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function WizardStepper({ currentStep }) {
  return (
    <ol className="mb-6 flex items-center gap-2">
      {STEPS.map((step, index) => {
        const done = currentStep > step.id;
        const active = currentStep === step.id;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div
                className={[
                  'flex size-8 items-center justify-center rounded-full text-xs font-bold transition',
                  done || active
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                    : 'bg-slate-100 text-slate-400',
                ].join(' ')}
              >
                {done ? <Check className="size-4" /> : step.id}
              </div>
              <span
                className={[
                  'hidden truncate text-center text-[11px] font-semibold sm:block',
                  active ? 'text-brand-700' : 'text-slate-400',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={[
                  'mb-5 hidden h-0.5 w-full max-w-10 shrink-0 rounded-full sm:block',
                  currentStep > step.id ? 'bg-brand-500' : 'bg-slate-200',
                ].join(' ')}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StudentEnrollmentWizard({
  open,
  step,
  form,
  fieldErrors,
  eligibleUsers,
  saving,
  onClose,
  onChange,
  onStepChange,
  onNext,
  onBack,
  onFinish,
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
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Inscripción de alumno</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Completa el expediente en 3 pasos. Tus datos se conservan al navegar.
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

        <div className="overflow-y-auto px-6 py-5">
          <WizardStepper currentStep={step} />

          {/* Steps stay mounted (hidden) so inputs/files keep state */}
          <div className={step === 1 ? 'space-y-4' : 'hidden'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="wiz-nombre" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  id="wiz-nombre"
                  type="text"
                  value={form.nombre}
                  onChange={(e) => onChange('nombre', e.target.value)}
                  className={fieldErrors.nombre ? inputErrorClass : inputClass}
                  placeholder="Nombre(s)"
                />
                <FieldError message={fieldErrors.nombre} />
              </div>
              <div>
                <label htmlFor="wiz-apellidos" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Apellidos
                </label>
                <input
                  id="wiz-apellidos"
                  type="text"
                  value={form.apellidos}
                  onChange={(e) => onChange('apellidos', e.target.value)}
                  className={fieldErrors.apellidos ? inputErrorClass : inputClass}
                  placeholder="Apellido paterno y materno"
                />
                <FieldError message={fieldErrors.apellidos} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="wiz-curp" className="mb-1.5 block text-sm font-medium text-slate-700">
                  CURP
                </label>
                <input
                  id="wiz-curp"
                  type="text"
                  value={form.curp}
                  onChange={(e) => onChange('curp', e.target.value.toUpperCase())}
                  className={fieldErrors.curp ? inputErrorClass : inputClass}
                  placeholder="18 caracteres"
                  maxLength={18}
                />
                <FieldError message={fieldErrors.curp} />
              </div>
              <div>
                <label htmlFor="wiz-fnac" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Fecha de nacimiento
                </label>
                <input
                  id="wiz-fnac"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => onChange('fechaNacimiento', e.target.value)}
                  className={fieldErrors.fechaNacimiento ? inputErrorClass : inputClass}
                />
                <FieldError message={fieldErrors.fechaNacimiento} />
              </div>
            </div>

            <div>
              <label htmlFor="wiz-dir" className="mb-1.5 block text-sm font-medium text-slate-700">
                Dirección
              </label>
              <textarea
                id="wiz-dir"
                rows={2}
                value={form.direccion}
                onChange={(e) => onChange('direccion', e.target.value)}
                className={fieldErrors.direccion ? inputErrorClass : inputClass}
                placeholder="Calle, número, colonia, ciudad"
              />
              <FieldError message={fieldErrors.direccion} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Vinculación de cuenta
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="wiz-user" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Usuario
                  </label>
                  <select
                    id="wiz-user"
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
                  <label htmlFor="wiz-mat" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Matrícula
                  </label>
                  <input
                    id="wiz-mat"
                    type="text"
                    value={form.matricula}
                    onChange={(e) => onChange('matricula', e.target.value)}
                    className={fieldErrors.matricula ? inputErrorClass : inputClass}
                    placeholder="EST-2026-001"
                  />
                  <FieldError message={fieldErrors.matricula} />
                </div>
              </div>
            </div>
          </div>

          <div className={step === 2 ? 'space-y-4' : 'hidden'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="wiz-sangre" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Tipo de sangre
                </label>
                <select
                  id="wiz-sangre"
                  value={form.tipoSangre}
                  onChange={(e) => onChange('tipoSangre', e.target.value)}
                  className={fieldErrors.tipoSangre ? inputErrorClass : inputClass}
                >
                  <option value="">Seleccionar…</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors.tipoSangre} />
              </div>
              <div>
                <label htmlFor="wiz-tel" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Teléfono de emergencia
                </label>
                <input
                  id="wiz-tel"
                  type="tel"
                  value={form.telefonoEmergencia}
                  onChange={(e) => onChange('telefonoEmergencia', e.target.value)}
                  className={fieldErrors.telefonoEmergencia ? inputErrorClass : inputClass}
                  placeholder="+52 …"
                />
                <FieldError message={fieldErrors.telefonoEmergencia} />
              </div>
            </div>

            <div>
              <label htmlFor="wiz-alergias" className="mb-1.5 block text-sm font-medium text-slate-700">
                Alergias
              </label>
              <textarea
                id="wiz-alergias"
                rows={2}
                value={form.alergias}
                onChange={(e) => onChange('alergias', e.target.value)}
                className={inputClass}
                placeholder="Indica alergias conocidas o escribe Ninguna"
              />
            </div>

            <div>
              <label htmlFor="wiz-tutor" className="mb-1.5 block text-sm font-medium text-slate-700">
                Nombre del tutor
              </label>
              <input
                id="wiz-tutor"
                type="text"
                value={form.tutorNombre}
                onChange={(e) => onChange('tutorNombre', e.target.value)}
                className={fieldErrors.tutorNombre ? inputErrorClass : inputClass}
                placeholder="Nombre completo del tutor o padre/madre"
              />
              <FieldError message={fieldErrors.tutorNombre} />
            </div>
          </div>

          <div className={step === 3 ? 'space-y-5' : 'hidden'}>
            <FileUpload
              label="Acta de nacimiento (PDF)"
              accept="application/pdf,.pdf"
              hint="Solo PDF · máx. 5 MB"
              value={form.actaNacimiento}
              onFileSelect={(file) => onChange('actaNacimiento', file)}
            />
            <FileUpload
              label="Foto de perfil (JPG/PNG)"
              accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
              hint="JPG o PNG · máx. 5 MB"
              value={form.fotoPerfil}
              onFileSelect={(file) => onChange('fotoPerfil', file)}
            />
            <FileUpload
              label="Comprobante de domicilio"
              accept="image/*,.pdf,application/pdf"
              hint="PDF o imagen · máx. 5 MB"
              value={form.comprobanteDomicilio}
              onFileSelect={(file) => onChange('comprobanteDomicilio', file)}
            />
            <FieldError message={fieldErrors.documentos} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={onBack}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
                Atrás
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Siguiente
                <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onFinish}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Finalizar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentEnrollmentWizard;
