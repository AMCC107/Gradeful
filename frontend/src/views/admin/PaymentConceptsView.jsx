import { useEffect, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { AdminPageHero, FeedbackBanner, inputClass } from './shared/AdminUi';
import { createPaymentConcept, fetchPaymentConcepts, updatePaymentConcept } from '../../services/payments.service';

const EMPTY_FORM = { nombre: '', tipo: 'colegiatura', monto_base: '', recurrente: false };
const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function PaymentConceptsView() {
  const [concepts, setConcepts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  const load = () => fetchPaymentConcepts()
    .then(setConcepts)
    .catch((error) => setFeedback({ error: error.message, success: '' }));

  useEffect(() => { load(); }, []);

  const showForm = (concept = null) => {
    setEditing(concept);
    setForm(concept ? {
      nombre: concept.nombre,
      tipo: concept.tipo,
      monto_base: String(concept.monto_base),
      recurrente: concept.recurrente,
    } : EMPTY_FORM);
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, monto_base: Number(form.monto_base) };
      const result = editing
        ? await updatePaymentConcept(editing.id, payload)
        : await createPaymentConcept(payload);
      setOpen(false);
      setFeedback({ error: '', success: result.message });
      await load();
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    }
  };

  const deactivate = async (concept) => {
    if (!window.confirm(`¿Desactivar "${concept.nombre}"?`)) return;
    try {
      await updatePaymentConcept(concept.id, { ...concept, is_active: false });
      setFeedback({ error: '', success: 'Concepto desactivado.' });
      await load();
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero eyebrow="Tesorería" title="Conceptos de Pago" description="Catálogo de colegiaturas, inscripciones y conceptos adicionales." />
      <FeedbackBanner {...feedback} onDismiss={() => setFeedback({ error: '', success: '' })} />
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-sm font-semibold text-slate-900">{concepts.length} conceptos registrados</p>
          <button type="button" onClick={() => showForm()} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white"><Plus className="size-4" />Nuevo concepto</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead><tr className="border-b bg-slate-50 text-xs uppercase text-slate-500"><th className="px-5 py-3">Nombre</th><th className="px-5 py-3">Tipo</th><th className="px-5 py-3">Monto base</th><th className="px-5 py-3">Frecuencia</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead>
            <tbody>{concepts.map((concept) => (
              <tr key={concept.id} className="border-b border-slate-100">
                <td className="px-5 py-3.5 font-semibold">{concept.nombre}</td><td className="px-5 py-3.5 capitalize">{concept.tipo}</td><td className="px-5 py-3.5">{currency.format(concept.monto_base)}</td><td className="px-5 py-3.5">{concept.recurrente ? 'Recurrente' : 'Único'}</td><td className="px-5 py-3.5">{concept.is_active ? 'Activo' : 'Inactivo'}</td>
                <td className="px-5 py-3.5 text-right"><button type="button" onClick={() => showForm(concept)} className="mr-2 rounded-lg border px-2.5 py-1.5"><Pencil className="size-3.5" /></button>{concept.is_active && <button type="button" onClick={() => deactivate(concept)} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600">Desactivar</button>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setOpen(false)}><form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"><div className="flex justify-between"><h2 className="font-semibold">{editing ? 'Editar concepto' : 'Nuevo concepto'}</h2><button type="button" onClick={() => setOpen(false)}><X className="size-5" /></button></div><input className={inputClass} placeholder="Nombre" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} required /><select className={inputClass} value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value })}><option value="colegiatura">Colegiatura</option><option value="inscripcion">Inscripción</option><option value="adicional">Adicional</option></select><input className={inputClass} type="number" min="0" step="0.01" placeholder="Monto base" value={form.monto_base} onChange={(event) => setForm({ ...form, monto_base: event.target.value })} required /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.recurrente} onChange={(event) => setForm({ ...form, recurrente: event.target.checked })} />Concepto recurrente</label><div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-4 py-2">Cancelar</button><button className="rounded-xl bg-brand-600 px-4 py-2 text-white">Guardar</button></div></form></div>}
    </div>
  );
}

export default PaymentConceptsView;
