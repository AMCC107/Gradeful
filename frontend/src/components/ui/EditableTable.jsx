/**
 * EditableTable — matriz de datos editable para calificaciones, asistencia, etc.
 *
 * Uso:
 * ```jsx
 * <EditableTable
 *   columns={[
 *     { id: 'name', label: 'Alumno', type: 'text', editable: false, width: '200px' },
 *     { id: 'p1', label: 'Parcial 1', type: 'number', editable: true, width: '100px' },
 *     {
 *       id: 'status',
 *       label: 'Estatus',
 *       type: 'select',
 *       editable: true,
 *       options: [
 *         { value: 'activo', label: 'Activo' },
 *         { value: 'baja', label: 'Baja' },
 *       ],
 *     },
 *     { id: 'present', label: 'Asistió', type: 'checkbox', editable: true },
 *   ]}
 *   data={[
 *     { id: 1, name: 'Ana Pérez', p1: 9.5, status: 'activo', present: true },
 *   ]}
 *   onChange={(rowId, columnId, value) => {
 *     // Actualiza estado / llama API
 *   }}
 * />
 * ```
 *
 * Props:
 * - columns: { id, label, type ('text'|'number'|'select'|'checkbox'), editable?, width?, options?, align?, min?, max?, step?, placeholder? }[]
 * - data: filas (cada una debe tener una clave única, por defecto `id`)
 * - onChange(rowId, columnId, newValue)
 * - rowKey?: string (default 'id')
 * - emptyMessage?: string
 * - disabled?: boolean
 * - className?: string
 */

import { useId } from 'react';

const cellPad = 'px-3 py-2';

const inputBaseClass =
  'w-full min-w-0 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-800 outline-none transition ' +
  'hover:border-slate-200 hover:bg-slate-50 ' +
  'focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const readOnlyClass = 'block w-full truncate px-2 py-1.5 text-sm text-slate-700';

function getAlignClass(align) {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
}

function formatDisplayValue(value, type) {
  if (value == null || value === '') return '—';
  if (type === 'checkbox') return value ? 'Sí' : 'No';
  return String(value);
}

function EditableCell({
  column,
  value,
  rowId,
  disabled,
  onChange,
}) {
  const inputId = useId();
  const align = getAlignClass(column.align ?? (column.type === 'number' || column.type === 'checkbox' ? 'center' : 'left'));
  const isEditable = Boolean(column.editable) && !disabled;

  if (!isEditable) {
    if (column.type === 'checkbox') {
      return (
        <div className={`flex justify-center ${cellPad}`}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            disabled
            readOnly
            className="size-4 rounded border-slate-300 text-brand-600 opacity-60"
            aria-label={column.label}
          />
        </div>
      );
    }

    return (
      <div className={`${cellPad} ${align}`}>
        <span className={readOnlyClass}>{formatDisplayValue(value, column.type)}</span>
      </div>
    );
  }

  if (column.type === 'checkbox') {
    return (
      <div className={`flex justify-center ${cellPad}`}>
        <input
          id={inputId}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(rowId, column.id, event.target.checked)}
          className="size-4 cursor-pointer rounded border-slate-300 text-brand-600 transition focus:ring-2 focus:ring-brand-500/30"
          aria-label={column.label}
        />
      </div>
    );
  }

  if (column.type === 'select') {
    const options = column.options ?? [];
    return (
      <div className={cellPad}>
        <select
          id={inputId}
          value={value ?? ''}
          onChange={(event) => onChange(rowId, column.id, event.target.value)}
          className={`${inputBaseClass} cursor-pointer appearance-none pr-7 ${align}`}
          aria-label={column.label}
        >
          <option value="" disabled>
            {column.placeholder || 'Seleccionar…'}
          </option>
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (column.type === 'number') {
    return (
      <div className={cellPad}>
        <input
          id={inputId}
          type="number"
          value={value ?? ''}
          min={column.min}
          max={column.max}
          step={column.step ?? 'any'}
          placeholder={column.placeholder ?? '—'}
          onChange={(event) => {
            const raw = event.target.value;
            onChange(rowId, column.id, raw === '' ? null : Number(raw));
          }}
          className={`${inputBaseClass} tabular-nums ${align}`}
          aria-label={column.label}
        />
      </div>
    );
  }

  // text (default)
  return (
    <div className={cellPad}>
      <input
        id={inputId}
        type="text"
        value={value ?? ''}
        placeholder={column.placeholder ?? ''}
        onChange={(event) => onChange(rowId, column.id, event.target.value)}
        className={`${inputBaseClass} ${align}`}
        aria-label={column.label}
      />
    </div>
  );
}

function EditableTable({
  columns = [],
  data = [],
  onChange,
  rowKey = 'id',
  emptyMessage = 'No hay registros para mostrar.',
  disabled = false,
  className = '',
}) {
  const handleChange = (rowId, columnId, value) => {
    onChange?.(rowId, columnId, value);
  };

  return (
    <div
      className={[
        'overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90">
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  style={column.width ? { width: column.width, minWidth: column.width } : undefined}
                  className={[
                    'whitespace-nowrap px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-600',
                    getAlignClass(
                      column.align ?? (column.type === 'number' || column.type === 'checkbox' ? 'center' : 'left'),
                    ),
                  ].join(' ')}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {data.map((row, index) => {
              const id = row[rowKey] ?? index;
              return (
                <tr
                  key={String(id)}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  {columns.map((column) => (
                    <td
                      key={`${id}-${column.id}`}
                      style={column.width ? { width: column.width, minWidth: column.width } : undefined}
                      className="align-middle"
                    >
                      <EditableCell
                        column={column}
                        value={row[column.id]}
                        rowId={id}
                        disabled={disabled}
                        onChange={handleChange}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EditableTable;
