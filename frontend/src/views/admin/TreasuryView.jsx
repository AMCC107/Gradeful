import { useEffect, useMemo, useState } from 'react';
import { Banknote, Search } from 'lucide-react';
import { AdminPageHero, FeedbackBanner, inputClass } from './shared/AdminUi';
import { fetchStudents } from '../../services/students.service';
import { fetchStudentAccount, registerPayment } from '../../services/payments.service';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function TreasuryView() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState('');
  const [account, setAccount] = useState(null);
  const [payment, setPayment] = useState({ charge_id: '', monto: '', metodo: 'efectivo', referencia: '' });
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const suggestions = useMemo(() => {
    const term = query.toLowerCase().trim();
    return term ? students.filter((student) => `${student.nombre} ${student.matricula}`.toLowerCase().includes(term)).slice(0, 8) : [];
  }, [students, query]);

  useEffect(() => {
    fetchStudents({ status: 'active' }).then(setStudents).catch((error) => setFeedback({ error: error.message, success: '' }));
  }, []);

  const selectStudent = async (student) => {
    setQuery(`${student.nombre} · ${student.matricula}`);
    try {
      const data = await fetchStudentAccount(student.id);
      setAccount(data);
      setFeedback({ error: '', success: '' });
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    }
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    try {
      const result = await registerPayment({
        student_id: account.student.id,
        charge_id: Number(payment.charge_id),
        monto: Number(payment.monto),
        metodo: payment.metodo,
        referencia: payment.referencia || null,
      });
      setFeedback({ error: '', success: result.message });
      setAccount(await fetchStudentAccount(account.student.id));
      setPayment({ charge_id: '', monto: '', metodo: 'efectivo', referencia: '' });
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero eyebrow="Tesorería" title="Caja / Punto de cobro" description="Consulta estados de cuenta y registra pagos contra cargos reales." />
      <FeedbackBanner {...feedback} onDismiss={() => setFeedback({ error: '', success: '' })} />
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><label className="mb-1.5 block text-sm font-medium">Buscar alumno</label><div className="relative max-w-xl"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre o matrícula" />{suggestions.length > 0 && <div className="absolute z-20 mt-1 w-full rounded-xl border bg-white py-1 shadow-lg">{suggestions.map((student) => <button key={student.id} type="button" onClick={() => selectStudent(student)} className="block w-full px-4 py-2 text-left hover:bg-brand-50"><strong>{student.nombre}</strong><span className="ml-2 text-xs text-slate-500">{student.matricula}</span></button>)}</div>}</div></div>
      {!account ? <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-sm text-slate-500">Selecciona un alumno para consultar su cuenta.</div> : <>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm"><div><p className="text-xs uppercase text-slate-500">Alumno seleccionado</p><h3 className="text-lg font-bold">{account.student.nombre}</h3><p className="text-sm text-slate-500">{account.student.matricula}</p></div><div className="rounded-xl bg-amber-50 px-4 py-2"><p className="text-xs text-amber-700">Saldo total</p><p className="text-xl font-bold text-amber-700">{currency.format(account.accountSummary.currentBalance)}</p></div></div>
        <div className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border bg-white p-5"><h3 className="mb-4 font-semibold">Cargos pendientes</h3>{account.pendingCharges.map((charge) => <div key={charge.id} className="flex justify-between border-b py-3 text-sm"><span>{charge.concept}<small className="ml-2 text-red-600">{charge.status === 'vencido' ? 'Vencido' : ''}</small></span><strong>{currency.format(charge.amount)}</strong></div>)}{!account.pendingCharges.length && <p className="text-sm text-slate-500">Sin cargos pendientes.</p>}</div><div className="rounded-2xl border bg-white p-5"><h3 className="mb-4 font-semibold">Registrar pago</h3><form onSubmit={submitPayment} className="space-y-3"><select className={inputClass} value={payment.charge_id} onChange={(event) => { const charge = account.pendingCharges.find((item) => String(item.id) === event.target.value); setPayment({ ...payment, charge_id: event.target.value, monto: charge ? String(charge.amount) : '' }); }} required><option value="">Selecciona un cargo</option>{account.pendingCharges.map((charge) => <option key={charge.id} value={charge.id}>{charge.concept} · {currency.format(charge.amount)}</option>)}</select><input className={inputClass} type="number" min="0.01" step="0.01" value={payment.monto} onChange={(event) => setPayment({ ...payment, monto: event.target.value })} placeholder="Monto" required /><select className={inputClass} value={payment.metodo} onChange={(event) => setPayment({ ...payment, metodo: event.target.value })}><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="tarjeta">Tarjeta</option></select><input className={inputClass} value={payment.referencia} onChange={(event) => setPayment({ ...payment, referencia: event.target.value })} placeholder="Referencia (opcional)" /><button className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white"><Banknote className="size-4" />Procesar pago</button></form></div></div>
        <div className="rounded-2xl border bg-white p-5"><h3 className="mb-4 font-semibold">Historial de pagos</h3>{account.paymentHistory.map((item) => <div key={item.id} className="grid grid-cols-4 border-b py-3 text-sm"><span>{item.concept}</span><strong className="text-emerald-700">{currency.format(item.amount)}</strong><span>{item.date}</span><span>{item.method}</span></div>)}</div>
      </>}
    </div>
  );
}

export default TreasuryView;
