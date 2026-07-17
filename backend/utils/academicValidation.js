const ROLE_STUDENT = 3;
const ROLE_TEACHER = 4;

function validationResult(errors, values) {
  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    values,
  };
}

function parsePositiveId(value, field, errors, label) {
  if (value === undefined || value === null || value === '') {
    errors[field] = `${label} es obligatorio.`;
    return null;
  }
  const id = Number(value);
  if (Number.isNaN(id) || id < 1) {
    errors[field] = `${label} no es válido.`;
    return null;
  }
  return id;
}

function validateStudentPayload(body, { isUpdate = false } = {}) {
  const errors = {};
  const matricula = typeof body.matricula === 'string' ? body.matricula.trim() : '';
  const userId = parsePositiveId(body.user_id, 'user_id', errors, 'El usuario');

  if (!matricula) {
    errors.matricula = 'La matrícula es obligatoria.';
  } else if (matricula.length < 3) {
    errors.matricula = 'La matrícula debe tener al menos 3 caracteres.';
  }

  // En update, user_id es opcional (no se reasigna normalmente); si viene, se valida
  if (isUpdate && (body.user_id === undefined || body.user_id === null || body.user_id === '')) {
    delete errors.user_id;
  }

  return validationResult(errors, {
    user_id: userId,
    matricula,
  });
}

function validateTeacherPayload(body, { isUpdate = false } = {}) {
  const errors = {};
  const numeroEmpleado =
    typeof body.numero_empleado === 'string' ? body.numero_empleado.trim() : '';
  const especialidad =
    typeof body.especialidad === 'string' ? body.especialidad.trim() : '';
  const userId = parsePositiveId(body.user_id, 'user_id', errors, 'El usuario');

  if (!numeroEmpleado) {
    errors.numero_empleado = 'El número de empleado es obligatorio.';
  } else if (numeroEmpleado.length < 3) {
    errors.numero_empleado = 'El número de empleado debe tener al menos 3 caracteres.';
  }

  if (isUpdate && (body.user_id === undefined || body.user_id === null || body.user_id === '')) {
    delete errors.user_id;
  }

  return validationResult(errors, {
    user_id: userId,
    numero_empleado: numeroEmpleado,
    especialidad: especialidad || null,
  });
}

function validateSubjectPayload(body) {
  const errors = {};
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const descripcion =
    typeof body.descripcion === 'string' ? body.descripcion.trim() : '';

  if (!nombre) {
    errors.nombre = 'El nombre de la materia es obligatorio.';
  } else if (nombre.length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
  }

  return validationResult(errors, {
    nombre,
    descripcion: descripcion || null,
  });
}

function validateCoursePayload(body) {
  const errors = {};
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const nivel = typeof body.nivel === 'string' ? body.nivel.trim() : '';

  if (!nombre) {
    errors.nombre = 'El nombre del curso es obligatorio.';
  } else if (nombre.length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
  }

  if (!nivel) {
    errors.nivel = 'El nivel del curso es obligatorio.';
  }

  return validationResult(errors, { nombre, nivel });
}

module.exports = {
  ROLE_STUDENT,
  ROLE_TEACHER,
  validateStudentPayload,
  validateTeacherPayload,
  validateSubjectPayload,
  validateCoursePayload,
};
