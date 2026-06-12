import { useState } from 'react';
import { CreditCard, DollarSign, CheckCircle2, AlertCircle, FileText, ExternalLink } from 'lucide-react';

function StudentPaymentsView() {
  const [showModal, setShowModal] = useState(false);
  const [activePayment, setActivePayment] = useState(null);

  const payments = [
    { id: 1, desc: 'Colegiatura Junio 2026', amount: 150.0, due: '15/06/2026', date: '—', method: '—', status: 'Pendiente' },
    { id: 2, desc: 'Colegiatura Mayo 2026', amount: 150.0, due: '15/05/2026', date: '12/05/2026', method: 'Tarjeta Crédito', status: 'Pagado' },
    { id: 3, desc: 'Colegiatura Abril 2026', amount: 150.0, due: '15/04/2026', date: '10/04/2026', method: 'Transferencia SPEI', status: 'Pagado' },
    { id: 4, desc: 'Colegiatura Marzo 2026', amount: 150.0, due: '15/03/2026', date: '14/03/2026', method: 'Tarjeta Débito', status: 'Pagado' },
    { id: 5, desc: 'Inscripción Semestre Feb-Jul 2026', amount: 300.0, due: '01/02/2026', date: '28/01/2026', method: 'Transferencia SPEI', status: 'Pagado' },
  ];

  const handlePayClick = (pay) => {
    setActivePayment(pay);
    setShowModal(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Colegiatura y Pagos</h1>
        <p className="text-sm text-slate-500">Administra tus pagos pendientes e historial de facturación</p>
      </div>

      {/* Account Balance Banner */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Saldo Pendiente</p>
            <h3 className="mt-1 text-2xl font-bold text-amber-600">$150.00 USD</h3>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertCircle className="size-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Pagado (Ciclo)</p>
            <h3 className="mt-1 text-2xl font-bold text-emerald-700">$750.00 USD</h3>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estatus de Cuenta</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">Al Corriente</h3>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CreditCard className="size-6" />
          </div>
        </div>
      </div>

      {/* Payment Reference Instructions */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
        <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
          <CreditCard className="size-4.5" /> Referencia Bancaria Única
        </h3>
        <p className="text-xs text-blue-800 mt-1">
          Puedes realizar tus transferencias interbancarias (SPEI) o depósitos con tu CLAVE personalizada:
        </p>
        <div className="mt-3 flex flex-wrap gap-4 items-center">
          <div className="bg-white px-4 py-2 rounded-xl border border-blue-100 font-mono text-sm font-bold text-blue-900 tracking-wider">
            CLABE: 0121 8000 9876 5432 10
          </div>
          <div className="text-xs text-blue-800">
            Concepto de pago obligatorio: <strong className="font-mono bg-blue-100/80 px-1.5 py-0.5 rounded">EST-2024-0847</strong>
          </div>
        </div>
      </div>

      {/* Payments History Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">Historial y Pendientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200">
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
              {payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{pay.desc}</td>
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-800">${pay.amount.toFixed(2)} USD</td>
                  <td className="px-6 py-4 text-slate-500">{pay.due}</td>
                  <td className="px-6 py-4 text-slate-500">{pay.date}</td>
                  <td className="px-6 py-4 text-slate-500">{pay.method}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      pay.status === 'Pagado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {pay.status === 'Pendiente' ? (
                      <button
                        type="button"
                        onClick={() => handlePayClick(pay)}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        Pagar ahora
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold text-xs transition-colors"
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

      {/* Payment Modal Mockup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]" role="dialog">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900">Simulación de Pago</h3>
            <p className="text-xs text-slate-500 mt-1">Procederás a pagar la cantidad para: {activePayment?.desc}</p>
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Monto total:</span>
                <span className="font-mono font-bold text-slate-900">${activePayment?.amount.toFixed(2)} USD</span>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => {
                  alert('Pago procesado correctamente (Simulación)');
                  setShowModal(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md"
              >
                Pagar con Tarjeta de Crédito/Débito
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors"
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
