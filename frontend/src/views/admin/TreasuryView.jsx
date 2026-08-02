import { useMemo, useState } from 'react';
import { Banknote, Search, X } from 'lucide-react';
import {
  AdminPageHero,
  FeedbackBanner,
  FieldError,
  inputClass,
  inputErrorClass,
} from './shared/AdminUi';

const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
];

const MOCK_CONCEPTS = [
  { id: 'c1', nombre: 'Colegiatura Agosto 2026', monto: 150 },
  { id: 'c2', nombre: 'Colegiatura Septiembre 2026', monto: 150 },
  { id: 'c3', nombre: 'Inscripción Ciclo Otoño 2026', monto: 300 },
];

const MOCK_STUDENTS = [
  {
    id: 1,
    name: 'Ana Pérez López',
    matricula: 'EST-2024-0847',
    career: 'Ing. Desarrollo de Software',
    balance: 300,
    pendingCharges: [
      { id: 'ch1', concept: 'Colegiatura Agosto 2026', amount: 150, due: '15/08/2026', overdue: true },
      { id: 'ch2', concept: 'Colegiatura Septiembre 2026', amount: 150, due: '15/09/2026', overdue: false },
    ],
    paymentHistory: [
      { id: 'p1', concept: 'Colegiatura Julio 2026', amount: 150, date: '12/07/2026', method: 'Transferencia' },
      { id: 'p2', concept: 'Inscripción Feb-Jul 2026', amount: 300, date: '28/01/2026', method: 'Tarjeta' },
    ],
  },
  {
    id: 2,
    name: 'Carlos Mendoza Ruiz',
    matricula: 'EST-2024-0912',
    career: 'Ing. Desarrollo de Software',
    balance: 150,
    pendingCharges: [
      { id: 'ch3', concept: 'Colegiatura Septiembre 2026', amount: 150, due: '15/09/2026', overdue: false },
    ],
    paymentHistory: [
      { id: 'p3', concept: 'Colegiatura Agosto 2026', amount: 150, date: '10/08/2026', method: 'Efectivo' },
      { id: 'p4', concept: 'Colegiatura Julio 2026', amount: 150, date: '14/07/2026', method: 'Transferencia' },
    ],
  },
  {
    id: 3,
    name: 'Diana Soto Vargas',
    matricula: 'EST-2023-0441',
    career: 'Ciencias de la Computación',
    balance: 0,
    pendingCharges: [],
    paymentHistory: [
      { id: 'p5', concept: 'Colegiatura Agosto 2026', amount: 150, date: '02/08/2026', method: 'Tarjeta' },
      { id: 'p6', concept: 'Colegiatura Julio 2026', amount: 150, date: '05/07/2026', method: 'Tarjeta' },
    ],
  },
];

function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)} USD`;
}

const EMPTY_PAYMENT_FORM = {
  conceptId: '',
  amount: '',
  method: 'efectivo',
};

function ManualPaymentModal({ open, form, fieldErrors, concepts, onClose, onChange, onSubmit }) {
  if (!open) return null;

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
            <h2 className="text-lg font-semibold text-slate-900">Registrar pago manual</h2>
            <p className="mt-0.5 text-sm text-slate-500">Captura el cobro en caja o ventanilla.</p>
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
            <label htmlFor="pay-concept" className="mb-1.5 block text-sm font-medium text-slate-700">
              Concepto a pagar
            </label>
            <select
              id="pay-concept"
              value={form.conceptId}
              onChange={(e) => onChange('conceptId', e.target.value)}
              className={fieldErrors.conceptId ? inputErrorClass : inputClass}
            >
              <option value="">Selecciona un concepto</option>
              {concepts.map((concept) => (
                <option key={concept.id} value={concept.id}>
                  {concept.nombre} · {formatCurrency(concept.monto)}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.conceptId} />
          </div>

          <div>
            <label htmlFor="pay-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
              Monto
            </label>
            <input
              id="pay-amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => onChange('amount', e.target.value)}
              className={fieldErrors.amount ? inputErrorClass : inputClass}
              placeholder="150.00"
            />
            <FieldError message={fieldErrors.amount} />
          </div>

          <div>
            <label htmlFor="pay-method" className="mb-1.5 block text-sm font-medium text-slate-700">
              Método de pago
            </label>
            <select
              id="pay-method"
              value={form.method}
              onChange={(e) => onChange('method', e.target.value)}
              className={inputClass}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

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
              Procesar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TreasuryView() {
  const [query, setQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_STUDENTS.filter(
      (student) =>
        student.name.toLowerCase().includes(q) ||
        student.matricula.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  const openPaymentModal = () => {
    setPaymentForm(EMPTY_PAYMENT_FORM);
    setFieldErrors({});
    setIsPaymentOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentOpen(false);
    setPaymentForm(EMPTY_PAYMENT_FORM);
    setFieldErrors({});
  };

  const onPaymentChange = (field, value) => {
    setPaymentForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'conceptId') {
        const concept = MOCK_CONCEPTS.find((item) => item.id === value);
        if (concept) next.amount = String(concept.monto);
      }
      return next;
    });
  };

  const onProcessPayment = (event) => {
    event.preventDefault();
    const errors = {};
    if (!paymentForm.conceptId) errors.conceptId = 'Selecciona un concepto.';
    if (
      paymentForm.amount === '' ||
      Number.isNaN(Number(paymentForm.amount)) ||
      Number(paymentForm.amount) <= 0
    ) {
      errors.amount = 'Ingresa un monto válido.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const concept = MOCK_CONCEPTS.find((item) => item.id === paymentForm.conceptId);
    const methodLabel =
      PAYMENT_METHODS.find((item) => item.value === paymentForm.method)?.label ?? paymentForm.method;

    setFeedback({
      error: '',
      success: `Pago de ${formatCurrency(paymentForm.amount)} procesado (${concept?.nombre} · ${methodLabel}).`,
    });
    closePaymentModal();
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Tesorería"
        title="Caja / Punto de cobro"
        description="Busca un alumno, consulta su estado de cuenta y registra pagos manuales."
      />

      <FeedbackBanner
        error={feedback.error}
        success={feedback.success}
        onDismiss={() => setFeedback({ error: '', success: '' })}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor="treasury-search" className="mb-1.5 block text-sm font-medium text-slate-700">
          Buscar alumno
        </label>
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="treasury-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre o matrícula…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              {suggestions.map((student) => (
                <li key={student.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start px-3.5 py-2.5 text-left hover:bg-brand-50"
                    onClick={() => {
                      setSelectedStudent(student);
                      setQuery(`${student.name} · ${student.matricula}`);
                    }}
                  >
                    <span className="text-sm font-semibold text-slate-900">{student.name}</span>
                    <span className="text-xs text-slate-500">
                      {student.matricula} · {student.career}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {!selectedStudent && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          Selecciona un alumno para ver su estado de cuenta.
        </div>
      )}

      {selectedStudent && (
        <>
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Alumno seleccionado</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
              <p className="text-sm text-slate-500">
                {selectedStudent.matricula} · {selectedStudent.career}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Saldo total</p>
                <p className="text-xl font-bold tabular-nums text-amber-700">
                  {formatCurrency(selectedStudent.balance)}
                </p>
              </div>
              <button
                type="button"
                onClick={openPaymentModal}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                <Banknote className="size-4" />
                Registrar Pago Manual
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Cargos pendientes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">Concepto</th>
                      <th className="px-5 py-3">Monto</th>
                      <th className="px-5 py-3">Vence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.pendingCharges.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-center text-slate-500">
                          Sin cargos pendientes.
                        </td>
                      </tr>
                    )}
                    {selectedStudent.pendingCharges.map((charge) => (
                      <tr key={charge.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3.5 font-medium text-slate-900">
                          {charge.concept}
                          {charge.overdue && (
                            <span className="ml-2 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-600 ring-1 ring-red-100">
                              Vencido
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                          {formatCurrency(charge.amount)}
                        </td>
                        <td className={`px-5 py-3.5 ${charge.overdue ? 'font-semibold text-red-600' : 'text-slate-600'}`}>
                          {charge.due}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Historial de pagos</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">Concepto</th>
                      <th className="px-5 py-3">Monto</th>
                      <th className="px-5 py-3">Fecha</th>
                      <th className="px-5 py-3">Método</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.paymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3.5 font-medium text-slate-900">{payment.concept}</td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-emerald-700">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{payment.date}</td>
                        <td className="px-5 py-3.5 text-slate-600">{payment.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      <ManualPaymentModal
        open={isPaymentOpen}
        form={paymentForm}
        fieldErrors={fieldErrors}
        concepts={MOCK_CONCEPTS}
        onClose={closePaymentModal}
        onChange={onPaymentChange}
        onSubmit={onProcessPayment}
      />
    </div>
  );
}

export default TreasuryView;
