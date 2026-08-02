import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Users } from 'lucide-react';

/**
 * Dropdown para alternar el hijo/alumno activo en el portal de padres.
 *
 * @param {object} props
 * @param {{ id: string|number, name: string, matricula?: string }[]} props.students
 * @param {string|number|null} props.selectedId
 * @param {(id: string|number) => void} props.onSelect
 * @param {string} [props.className]
 */
function StudentSelector({ students = [], selectedId, onSelect, className = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();

  const selected = students.find((student) => student.id === selectedId) ?? students[0] ?? null;

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!selected) return null;

  return (
    <div ref={rootRef} className={['relative', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={[
          'inline-flex max-w-[240px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition',
          'hover:border-brand-300 hover:bg-brand-50/40',
          open ? 'border-brand-400 ring-2 ring-brand-500/20' : '',
        ].join(' ')}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Users className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Hijo activo
          </span>
          <span className="block truncate text-sm font-semibold text-slate-900">{selected.name}</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Seleccionar hijo"
          className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {students.map((student) => {
            const isActive = student.id === selected.id;
            return (
              <li key={student.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  className={[
                    'flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition',
                    isActive ? 'bg-brand-50' : 'hover:bg-slate-50',
                  ].join(' ')}
                  onClick={() => {
                    onSelect?.(student.id);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{student.name}</span>
                    {student.matricula && (
                      <span className="block text-xs text-slate-500">{student.matricula}</span>
                    )}
                  </span>
                  {isActive && <Check className="size-4 shrink-0 text-brand-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default StudentSelector;
