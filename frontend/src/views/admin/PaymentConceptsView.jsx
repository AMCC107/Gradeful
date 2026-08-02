import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  AdminPageHero,
  FeedbackBanner,
  FieldError,
  inputClass,
  inputErrorClass,
} from './shared/AdminUi';

const INITIAL_CONCEPTS = [
  {
    id: 1,
    nombre: 'Colegiatura Agosto 2026',
    monto: 150,
    vencimiento: '2026-08-15',
    aplicaRecargos: true,
  },
  {
    id: 2,
    nombre: 'Colegiatura Septiembre 2026',
    monto: 150,
    vencimiento: '2026-09-15',
    aplicaRecargos: true,
  },
  {
    id: 3,
    nombre: 'Inscripción Ciclo Otoño 2026',
    monto: 300,
    vencimiento: '2026-08-01',
    aplicaRecargos: false,
  },
];

const EMPTY_FORM = {
  nombre: '',
  monto: '',
  vencimiento: '',
  aplicaRecargos: false,
};

function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)} USD`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function ConceptFormModal({ open, editing, form, fieldErrors, onClose, onChange, onSubmit }) {
  if (!open) return null;
  const isEdit = Boolean(editing);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit ? 'Editar concepto' : 'Nuevo concepto de cobro'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Define nombre, monto, vencimiento y recargos.
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
            <label htmlFor="concept-nombre" className="mb-1.5 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="concept-nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => onChange('nombre', e.target.value)}
              className={fieldErrors.nombre ? inputErrorClass : inputClass}
              placeholder='Ej. "Colegiatura Septiembre"'
            />
            <FieldError message={fieldErrors.nombre} />
          </div>

          <div>
            <label htmlFor="concept-monto" className="mb-1.5 block text-sm font-medium text-slate-700">
              Monto ($)
            </label>
            <input
              id="concept-monto"
              type="number"
              min="0"
              step="0.01"
              value={form.monto}
              onChange={(e) => onChange('monto', e.target.value)}
              className={fieldErrors.monto ? inputErrorClass : inputClass}
              placeholder="150.00"
            />
            <FieldError message={fieldErrors.monto} />
          </div>

          <div>
            <label htmlFor="concept-vencimiento" className="mb-1.5 block text-sm font-medium text-slate-700">
              Fecha de vencimiento
            </label>
            <input
              id="concept-vencimiento"
              type="date"
              value={form.vencimiento}
              onChange={(e) => onChange('vencimiento', e.target.value)}
              className={fieldErrors.vencimiento ? inputErrorClass : inputClass}
            />
            <FieldError message={fieldErrors.vencimiento} />
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Aplica recargos</p>
              <p className="text-xs text-slate-500">Se cobrarán recargos tras la fecha límite.</p>
            </div>
            <input
              type="checkbox"
              checked={form.aplicaRecargos}
              onChange={(e) => onChange('aplicaRecargos', e.target.checked)}
              className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {isEdit ? 'Guardar cambios' : 'Crear concepto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PaymentConceptsView() {
  const [concepts, setConcepts] = useState(INITIAL_CONCEPTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  const sortedConcepts = useMemo(
    () => [...concepts].sort((a, b) => a.vencimiento.localeCompare(b.vencimiento)),
    [concepts],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (concept) => {
    setEditing(concept);
    setForm({
      nombre: concept.nombre,
      monto: String(concept.monto),
      vencimiento: concept.vencimiento,
      aplicaRecargos: concept.aplicaRecargos,
    });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
  };

  const onFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
    if (form.monto === '' || Number.isNaN(Number(form.monto)) || Number(form.monto) < 0) {
      errors.monto = 'Ingresa un monto válido.';
    }
    if (!form.vencimiento) errors.vencimiento = 'La fecha de vencimiento es obligatoria.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      nombre: form.nombre.trim(),
      monto: Number(form.monto),
      vencimiento: form.vencimiento,
      aplicaRecargos: Boolean(form.aplicaRecargos),
    };

    if (editing) {
      setConcepts((prev) =>
        prev.map((item) => (item.id === editing.id ? { ...item, ...payload } : item)),
      );
      setFeedback({ error: '', success: 'Concepto actualizado correctamente.' });
    } else {
      const nextId = Math.max(0, ...concepts.map((c) => c.id)) + 1;
      setConcepts((prev) => [...prev, { id: nextId, ...payload }]);
      setFeedback({ error: '', success: 'Concepto creado correctamente.' });
    }

    closeModal();
  };

  const onDelete = (concept) => {
    const confirmed = window.confirm(`¿Eliminar el concepto "${concept.nombre}"?`);
    if (!confirmed) return;
    setConcepts((prev) => prev.filter((item) => item.id !== concept.id));
    setFeedback({ error: '', success: 'Concepto eliminado.' });
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Tesorería"
        title="Conceptos de Pago"
        description="Catálogo de cargos: colegiaturas, inscripciones y demás conceptos de cobro."
      />

      <FeedbackBanner
        error={feedback.error}
        success={feedback.success}
        onDismiss={() => setFeedback({ error: '', success: '' })}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Conceptos</h3>
            <p className="text-xs text-slate-500">
              {sortedConcepts.length} concepto{sortedConcepts.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="size-4" />
            Nuevo concepto
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Monto</th>
                <th className="px-5 py-3">Vencimiento</th>
                <th className="px-5 py-3">Recargos</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedConcepts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    No hay conceptos registrados.
                  </td>
                </tr>
              )}
              {sortedConcepts.map((concept) => (
                <tr key={concept.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{concept.nombre}</td>
                  <td className="px-5 py-3.5 font-mono text-sm font-semibold text-slate-800">
                    {formatCurrency(concept.monto)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{formatDate(concept.vencimiento)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                        concept.aplicaRecargos
                          ? 'bg-amber-50 text-amber-700 ring-amber-100'
                          : 'bg-slate-50 text-slate-600 ring-slate-200'
                      }`}
                    >
                      {concept.aplicaRecargos ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(concept)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="size-3.5" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(concept)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConceptFormModal
        open={isModalOpen}
        editing={editing}
        form={form}
        fieldErrors={fieldErrors}
        onClose={closeModal}
        onChange={onFormChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default PaymentConceptsView;
