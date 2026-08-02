import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Send,
} from 'lucide-react';
import { FileUpload } from '../../../components/ui';
import { AdminPageHero, FeedbackBanner } from '../../admin/shared/AdminUi';

const ACCOUNT_SUMMARY = {
  currentBalance: 300,
  overdueCount: 1,
  upcomingCount: 1,
};

const PENDING_CHARGES = [
  {
    id: 1,
    concept: 'Colegiatura Agosto 2026',
    amount: 150,
    due: '15/08/2026',
    status: 'vencido',
  },
  {
    id: 2,
    concept: 'Colegiatura Septiembre 2026',
    amount: 150,
    due: '15/09/2026',
    status: 'proximo',
  },
];

const PAYMENT_HISTORY = [
  {
    id: 1,
    concept: 'Colegiatura Julio 2026',
    amount: 150,
    date: '12/07/2026',
    method: 'Transferencia SPEI',
    status: 'Pagado',
  },
  {
    id: 2,
    concept: 'Colegiatura Junio 2026',
    amount: 150,
    date: '10/06/2026',
    method: 'Tarjeta Débito',
    status: 'Pagado',
  },
  {
    id: 3,
    concept: 'Inscripción Feb-Jul 2026',
    amount: 300,
    date: '28/01/2026',
    method: 'Transferencia SPEI',
    status: 'Pagado',
  },
];

function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)} USD`;
}

function StudentPaymentsView() {
  const [receiptFile, setReceiptFile] = useState(null);
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  const overdueCharges = PENDING_CHARGES.filter((item) => item.status === 'vencido');
  const upcomingCharges = PENDING_CHARGES.filter((item) => item.status === 'proximo');

  const handleReportTransfer = (event) => {
    event.preventDefault();
    if (!receiptFile) {
      setFeedback({ error: 'Adjunta un comprobante (PDF o imagen) para continuar.', success: '' });
      return;
    }
    setFeedback({
      error: '',
      success: `Comprobante "${receiptFile.name}" enviado. Tesorería lo revisará pronto.`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Portal estudiantil"
        title="Estado de Cuenta"
        description="Consulta saldo, cargos pendientes e historial de pagos. Reporta transferencias con tu comprobante."
      />

      <FeedbackBanner
        error={feedback.error}
        success={feedback.success}
        onDismiss={() => setFeedback({ error: '', success: '' })}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Saldo actual</p>
              <h3 className="mt-1 text-2xl font-bold tabular-nums text-amber-600">
                {formatCurrency(ACCOUNT_SUMMARY.currentBalance)}
              </h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CreditCard className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Total pendiente de liquidar</p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Pagos vencidos</p>
              <h3 className="mt-1 text-2xl font-bold text-red-700">{ACCOUNT_SUMMARY.overdueCount}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertCircle className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-red-600">
            {overdueCharges[0]?.concept ?? 'Sin cargos vencidos'}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Próximos a vencer</p>
              <h3 className="mt-1 text-2xl font-bold text-amber-800">{ACCOUNT_SUMMARY.upcomingCount}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-amber-700">
            {upcomingCharges[0] ? `Vence ${upcomingCharges[0].due}` : 'Sin próximos vencimientos'}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Cargos pendientes</h3>
          <p className="text-xs text-slate-500">Los vencidos aparecen resaltados en rojo.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Concepto</th>
                <th className="px-5 py-3">Monto</th>
                <th className="px-5 py-3">Vencimiento</th>
                <th className="px-5 py-3 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {PENDING_CHARGES.map((charge) => {
                const isOverdue = charge.status === 'vencido';
                return (
                  <tr
                    key={charge.id}
                    className={`border-b border-slate-50 last:border-0 ${
                      isOverdue ? 'bg-red-50/60' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className={`px-5 py-3.5 font-medium ${isOverdue ? 'text-red-800' : 'text-slate-900'}`}>
                      <span className="inline-flex items-center gap-2">
                        {isOverdue && <AlertTriangle className="size-4 text-red-500" />}
                        {charge.concept}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 font-mono font-semibold ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>
                      {formatCurrency(charge.amount)}
                    </td>
                    <td className={`px-5 py-3.5 ${isOverdue ? 'font-semibold text-red-600' : 'text-slate-600'}`}>
                      {charge.due}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isOverdue
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isOverdue ? 'Vencido' : 'Próximo a vencer'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Historial de pagos recientes</h3>
            <p className="text-xs text-slate-500">Movimientos ya conciliados en tu cuenta.</p>
          </div>
          <CheckCircle2 className="size-5 text-emerald-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Concepto</th>
                <th className="px-5 py-3">Monto</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Método</th>
                <th className="px-5 py-3 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENT_HISTORY.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{payment.concept}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-emerald-700">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{payment.date}</td>
                  <td className="px-5 py-3.5 text-slate-600">{payment.method}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <form
        onSubmit={handleReportTransfer}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Reportar transferencia</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Sube tu comprobante bancario (PDF o JPG) para que tesorería valide el pago.
          </p>
        </div>

        <FileUpload
          accept="image/jpeg,image/png,image/jpg,application/pdf,.pdf,.jpg,.jpeg,.png"
          maxSize={5 * 1024 * 1024}
          label="Comprobante de pago"
          hint="PDF o imagen · máx. 5 MB"
          onFileSelect={setReceiptFile}
        />

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <Send className="size-4" />
            Enviar comprobante
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentPaymentsView;
