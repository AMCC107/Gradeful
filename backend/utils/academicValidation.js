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
  const clave = typeof body.clave === 'string' ? body.clave.trim().toUpperCase() : '';
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const descripcion =
    typeof body.descripcion === 'string' ? body.descripcion.trim() : '';

  if (!nombre) {
    errors.nombre = 'El nombre de la materia es obligatorio.';
  } else if (nombre.length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
  }

  return validationResult(errors, {
    clave: clave || null,
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

function validateGroupPayload(body) {
  const errors = {};
  const courseId = parsePositiveId(body.course_id, 'course_id', errors, 'El curso');
  const subjectId = parsePositiveId(body.subject_id, 'subject_id', errors, 'La materia');
  const teacherId = parsePositiveId(body.teacher_id, 'teacher_id', errors, 'El profesor');
  const schoolCycleId = body.school_cycle_id
    ? parsePositiveId(body.school_cycle_id, 'school_cycle_id', errors, 'El ciclo escolar')
    : null;
  const nombre = String(body.nombre || 'A').trim();
  const turno = String(body.turno || 'matutino').trim().toLowerCase();
  if (!nombre) errors.nombre = 'El nombre del grupo es obligatorio.';
  if (!['matutino', 'vespertino', 'nocturno', 'mixto'].includes(turno)) {
    errors.turno = 'El turno no es válido.';
  }

  let capacidad = null;
  if (body.capacidad_maxima === undefined || body.capacidad_maxima === null || body.capacidad_maxima === '') {
    errors.capacidad_maxima = 'La capacidad máxima es obligatoria.';
  } else {
    capacidad = Number(body.capacidad_maxima);
    if (Number.isNaN(capacidad) || !Number.isInteger(capacidad) || capacidad < 1) {
      errors.capacidad_maxima = 'La capacidad debe ser un entero mayor o igual a 1.';
    }
  }

  return validationResult(errors, {
    course_id: courseId,
    subject_id: subjectId,
    teacher_id: teacherId,
    school_cycle_id: schoolCycleId,
    nombre,
    turno,
    capacidad_maxima: capacidad,
  });
}

function validateEnrollmentPayload(body) {
  const errors = {};
  const groupId = parsePositiveId(body.group_id, 'group_id', errors, 'El grupo');
  const studentId = parsePositiveId(body.student_id, 'student_id', errors, 'El alumno');

  return validationResult(errors, {
    group_id: groupId,
    student_id: studentId,
  });
}

const ACTIVITY_TYPES = ['actividad', 'tarea'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateActivityPayload(body) {
  const errors = {};
  const groupId = parsePositiveId(body.group_id, 'group_id', errors, 'El grupo');
  const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : '';
  const descripcion =
    typeof body.descripcion === 'string' ? body.descripcion.trim() : '';
  const tipo = typeof body.tipo === 'string' ? body.tipo.trim().toLowerCase() : '';
  const fechaEntrega =
    typeof body.fecha_entrega === 'string' ? body.fecha_entrega.trim() : '';

  if (!titulo) {
    errors.titulo = 'El título es obligatorio.';
  } else if (titulo.length < 3) {
    errors.titulo = 'El título debe tener al menos 3 caracteres.';
  }

  if (!tipo) {
    errors.tipo = 'El tipo es obligatorio.';
  } else if (!ACTIVITY_TYPES.includes(tipo)) {
    errors.tipo = 'El tipo debe ser "actividad" o "tarea".';
  }

  if (!fechaEntrega) {
    errors.fecha_entrega = 'La fecha de entrega es obligatoria.';
  } else if (!DATE_REGEX.test(fechaEntrega)) {
    errors.fecha_entrega = 'Usa el formato YYYY-MM-DD.';
  }

  return validationResult(errors, {
    group_id: groupId,
    titulo,
    descripcion: descripcion || null,
    tipo,
    fecha_entrega: fechaEntrega,
  });
}

module.exports = {
  ROLE_STUDENT,
  ROLE_TEACHER,
  ACTIVITY_TYPES,
  validateStudentPayload,
  validateTeacherPayload,
  validateSubjectPayload,
  validateCoursePayload,
  validateGroupPayload,
  validateEnrollmentPayload,
  validateActivityPayload,
};
