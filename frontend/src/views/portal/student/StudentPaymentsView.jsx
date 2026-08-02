import { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

/**
 * @param {object} props
 * @param {{ pendingBalance?: string, totalPaid?: string, accountStatus?: string }} [props.summary]
 * @param {{ clabe?: string, paymentConcept?: string }} [props.bankReference]
 * @param {{ id: string|number, desc: string, amount: number, due: string, date: string, method: string, status: string }[]} [props.payments]
 * @param {(payment: object) => void} [props.onPay]
 * @param {(payment: object) => void} [props.onViewReceipt]
 */
function StudentPaymentsView({
  summary = {},
  bankReference = {},
  payments = [],
  onPay,
  onViewReceipt,
}) {
  const [showModal, setShowModal] = useState(false);
  const [activePayment, setActivePayment] = useState(null);

  const {
    pendingBalance = '—',
    totalPaid = '—',
    accountStatus = '—',
  } = summary;

  const { clabe, paymentConcept } = bankReference;

  const handlePayClick = (pay) => {
    setActivePayment(pay);
    setShowModal(true);
  };

  const handleConfirmPay = () => {
    if (activePayment) {
      onPay?.(activePayment);
    }
    setShowModal(false);
    setActivePayment(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Colegiatura y Pagos</h1>
        <p className="text-sm text-slate-500">Administra tus pagos pendientes e historial de facturación</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Saldo Pendiente</p>
            <h3 className="mt-1 text-2xl font-bold text-amber-600">{pendingBalance}</h3>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertCircle className="size-6" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Pagado (Ciclo)</p>
            <h3 className="mt-1 text-2xl font-bold text-emerald-700">{totalPaid}</h3>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estatus de Cuenta</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">{accountStatus}</h3>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CreditCard className="size-6" />
          </div>
        </div>
      </div>

      {(clabe || paymentConcept) && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-blue-900">
            <CreditCard className="size-4.5" /> Referencia Bancaria Única
          </h3>
          <p className="mt-1 text-xs text-blue-800">
            Puedes realizar tus transferencias interbancarias (SPEI) o depósitos con tu CLAVE personalizada:
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {clabe && (
              <div className="rounded-xl border border-blue-100 bg-white px-4 py-2 font-mono text-sm font-bold tracking-wider text-blue-900">
                CLABE: {clabe}
              </div>
            )}
            {paymentConcept && (
              <div className="text-xs text-blue-800">
                Concepto de pago obligatorio:{' '}
                <strong className="rounded bg-blue-100/80 px-1.5 py-0.5 font-mono">{paymentConcept}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-900">Historial y Pendientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700">
              <tr>
                <th className="px-6 py-4">Concepto</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Fecha Límite</th>
                <th className="px-6 py-4">Fecha Pago</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4 text-center">Estatus</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    No hay pagos registrados.
                  </td>
                </tr>
              )}
              {payments.map((pay) => (
                <tr key={pay.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-900">{pay.desc}</td>
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-800">
                    ${Number(pay.amount).toFixed(2)} USD
                  </td>
                  <td className="px-6 py-4 text-slate-500">{pay.due}</td>
                  <td className="px-6 py-4 text-slate-500">{pay.date}</td>
                  <td className="px-6 py-4 text-slate-500">{pay.method}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        pay.status === 'Pagado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {pay.status === 'Pendiente' ? (
                      <button
                        type="button"
                        onClick={() => handlePayClick(pay)}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                      >
                        Pagar ahora
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onViewReceipt?.(pay)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
                      >
                        <FileText className="size-3.5" /> Recibo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Confirmar pago</h3>
            <p className="mt-1 text-xs text-slate-500">
              Procederás a pagar la cantidad para: {activePayment?.desc}
            </p>
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Monto total:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${activePayment != null ? Number(activePayment.amount).toFixed(2) : '0.00'} USD
                </span>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={handleConfirmPay}
                className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-md transition-colors hover:bg-blue-700"
              >
                Pagar con Tarjeta de Crédito/Débito
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setActivePayment(null);
                }}
                className="w-full rounded-xl bg-slate-100 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPaymentsView;
