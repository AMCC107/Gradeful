const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Validación manual estructurada para crear/editar usuarios.
 * Devuelve un objeto { campo: mensaje } vacío si todo es válido.
 */
function validateUserPayload(body, { isUpdate = false } = {}) {
  const errors = {};
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const correo = typeof body.correo === 'string' ? body.correo.trim() : '';
  const contraseña = typeof body.contraseña === 'string' ? body.contraseña : '';
  const roleRaw = body.role_id;

  if (!nombre) {
    errors.nombre = 'El nombre es obligatorio.';
  } else if (nombre.length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
  }

  if (!correo) {
    errors.correo = 'El correo es obligatorio.';
  } else if (!EMAIL_REGEX.test(correo)) {
    errors.correo = 'El correo no tiene un formato válido.';
  }

  if (roleRaw === undefined || roleRaw === null || roleRaw === '') {
    errors.role_id = 'El rol es obligatorio.';
  } else if (Number.isNaN(Number(roleRaw)) || Number(roleRaw) < 1) {
    errors.role_id = 'El rol seleccionado no es válido.';
  }

  if (!isUpdate) {
    if (!contraseña) {
      errors.contraseña = 'La contraseña es obligatoria.';
    } else if (contraseña.length < MIN_PASSWORD_LENGTH) {
      errors.contraseña = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
  } else if (contraseña && contraseña.length < MIN_PASSWORD_LENGTH) {
    errors.contraseña = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    values: {
      nombre,
      correo: correo.toLowerCase(),
      contraseña,
      role_id: roleRaw === undefined || roleRaw === null || roleRaw === ''
        ? null
        : Number(roleRaw),
    },
  };
}

module.exports = {
  validateUserPayload,
  EMAIL_REGEX,
  MIN_PASSWORD_LENGTH,
};
