import { useId, useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, X } from 'lucide-react';

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function isImageFile(file) {
  return Boolean(file?.type?.startsWith('image/'));
}

/**
 * Zona de subida de documentos y fotos con drag & drop.
 *
 * @param {object} props
 * @param {string} [props.accept] - Tipos MIME o extensiones (ej. "image/*,.pdf")
 * @param {number} [props.maxSize] - Tamaño máximo en bytes
 * @param {(file: File | null) => void} [props.onFileSelect] - Callback al seleccionar o limpiar
 * @param {File | null} [props.value] - Modo controlado: archivo actual desde el padre
 * @param {string} [props.label]
 * @param {string} [props.hint]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
function FileUpload({
  accept = 'image/*,.pdf,.doc,.docx',
  maxSize = 5 * 1024 * 1024,
  onFileSelect,
  value,
  label = 'Subir archivo',
  hint,
  disabled = false,
  className = '',
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [internalFile, setInternalFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const isControlled = value !== undefined;
  const file = isControlled ? value : internalFile;

  const defaultHint = hint ?? `Máximo ${formatBytes(maxSize)}. Arrastra o haz clic para seleccionar.`;

  const setFile = (next) => {
    if (!isControlled) setInternalFile(next);
  };

  const clearFile = () => {
    setFile(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onFileSelect?.(null);
  };

  const validateAndSelect = (nextFile) => {
    if (!nextFile) return;

    if (maxSize && nextFile.size > maxSize) {
      setError(`El archivo supera el límite de ${formatBytes(maxSize)}.`);
      setFile(null);
      onFileSelect?.(null);
      return;
    }

    setError('');
    setFile(nextFile);
    onFileSelect?.(nextFile);
  };

  const handleInputChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null;
    validateAndSelect(nextFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const nextFile = event.dataTransfer.files?.[0] ?? null;
    validateAndSelect(nextFile);
  };

  const FileIcon = isImageFile(file) ? ImageIcon : FileText;

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      {!file ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            'group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition',
            isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-slate-200 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/40',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          ].join(' ')}
        >
          <div
            className={[
              'flex size-11 items-center justify-center rounded-xl transition',
              isDragging
                ? 'bg-brand-100 text-brand-700'
                : 'bg-white text-slate-500 ring-1 ring-slate-200 group-hover:text-brand-600',
            ].join(' ')}
          >
            <Upload className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic'}
            </p>
            <p className="mt-1 text-xs text-slate-500">{defaultHint}</p>
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <FileIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            disabled={disabled}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Quitar archivo"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={handleInputChange}
      />

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default FileUpload;
