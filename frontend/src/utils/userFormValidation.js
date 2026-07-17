const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Validación de formulario de usuario (cliente).
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateUserForm(form, { isEdit = false } = {}) {
  const errors = {};
  const nombre = form.nombre?.trim() || '';
  const correo = form.correo?.trim() || '';
  const contraseña = form.contraseña || '';
  const roleId = form.role_id;

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

  if (roleId === '' || roleId === null || roleId === undefined) {
    errors.role_id = 'Selecciona un rol.';
  }

  if (!isEdit) {
    if (!contraseña) {
      errors.contraseña = 'La contraseña es obligatoria.';
    } else if (contraseña.length < MIN_PASSWORD_LENGTH) {
      errors.contraseña = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
  } else if (contraseña && contraseña.length < MIN_PASSWORD_LENGTH) {
    errors.contraseña = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export { MIN_PASSWORD_LENGTH };
