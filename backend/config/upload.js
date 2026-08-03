const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOAD_ROOT = process.env.UPLOAD_ROOT || path.join(__dirname, '..', 'uploads');

function createUpload(subdirectory, allowedMimeTypes, maxSize = 5 * 1024 * 1024) {
  const destination = path.join(UPLOAD_ROOT, subdirectory);
  fs.mkdirSync(destination, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, destination),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(null, `${unique}${extension}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxSize, files: 1 },
    fileFilter: (_req, file, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(new Error('Tipo de archivo no permitido.'));
      }
      return callback(null, true);
    },
  });
}

const documentUpload = createUpload('justifications', [
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

const excelUpload = createUpload('imports', [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]);

const paymentProofUpload = createUpload('payment-proofs', [
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

module.exports = { UPLOAD_ROOT, documentUpload, excelUpload, paymentProofUpload };
