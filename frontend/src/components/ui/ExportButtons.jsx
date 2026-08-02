import { FileDown, FileSpreadsheet } from 'lucide-react';

const baseButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Contenedor de acciones para exportar a PDF y Excel.
 *
 * @param {object} props
 * @param {() => void} [props.onExportPDF]
 * @param {() => void} [props.onExportExcel]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.disabledPDF]
 * @param {boolean} [props.disabledExcel]
 * @param {boolean} [props.loadingPDF]
 * @param {boolean} [props.loadingExcel]
 * @param {string} [props.className]
 */
function ExportButtons({
  onExportPDF,
  onExportExcel,
  disabled = false,
  disabledPDF = false,
  disabledExcel = false,
  loadingPDF = false,
  loadingExcel = false,
  className = '',
}) {
  const pdfDisabled = disabled || disabledPDF || loadingPDF || !onExportPDF;
  const excelDisabled = disabled || disabledExcel || loadingExcel || !onExportExcel;

  return (
    <div className={['flex flex-wrap items-center gap-2', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        onClick={onExportPDF}
        disabled={pdfDisabled}
        className={[
          baseButtonClass,
          'border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
        ].join(' ')}
      >
        <FileDown className="size-4" />
        {loadingPDF ? 'Exportando…' : 'Exportar a PDF'}
      </button>

      <button
        type="button"
        onClick={onExportExcel}
        disabled={excelDisabled}
        className={[
          baseButtonClass,
          'bg-brand-600 text-white hover:bg-brand-700',
        ].join(' ')}
      >
        <FileSpreadsheet className="size-4" />
        {loadingExcel ? 'Exportando…' : 'Exportar a Excel'}
      </button>
    </div>
  );
}

export default ExportButtons;
