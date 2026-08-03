const ROLE_ADMIN = 1;
const ROLE_PARENT = 2;
const ROLE_STUDENT = 3;
const ROLE_TEACHER = 4;

async function getStudentForUser(db, userId) {
  return db.get(
    'SELECT id, user_id, matricula, is_active FROM students WHERE user_id = ?',
    [userId]
  );
}

async function getTeacherForUser(db, userId) {
  return db.get(
    'SELECT id, user_id, numero_empleado, is_active FROM teachers WHERE user_id = ?',
    [userId]
  );
}

async function canAccessStudent(db, user, studentId) {
  const normalizedId = Number(studentId);
  if (!user || !normalizedId) return false;
  if (user.role_id === ROLE_ADMIN) return true;

  if (user.role_id === ROLE_STUDENT) {
    const student = await getStudentForUser(db, user.id);
    return student?.id === normalizedId;
  }

  if (user.role_id === ROLE_PARENT) {
    const link = await db.get(
      `SELECT id FROM parent_students
       WHERE parent_user_id = ? AND student_id = ? AND is_active = 1`,
      [user.id, normalizedId]
    );
    return Boolean(link);
  }

  if (user.role_id === ROLE_TEACHER) {
    const teacher = await getTeacherForUser(db, user.id);
    if (!teacher) return false;
    const enrollment = await db.get(
      `SELECT e.id
       FROM enrollments e
       INNER JOIN groups g ON g.id = e.group_id
       WHERE e.student_id = ? AND g.teacher_id = ?
       LIMIT 1`,
      [normalizedId, teacher.id]
    );
    return Boolean(enrollment);
  }

  return false;
}

async function canAccessGroup(db, user, groupId, { write = false } = {}) {
  const normalizedId = Number(groupId);
  if (!user || !normalizedId) return false;
  if (user.role_id === ROLE_ADMIN) return true;

  if (user.role_id === ROLE_TEACHER) {
    const teacher = await getTeacherForUser(db, user.id);
    if (!teacher) return false;
    const group = await db.get(
      'SELECT id FROM groups WHERE id = ? AND teacher_id = ?',
      [normalizedId, teacher.id]
    );
    return Boolean(group);
  }

  if (write) return false;

  if (user.role_id === ROLE_STUDENT) {
    const student = await getStudentForUser(db, user.id);
    if (!student) return false;
    const enrollment = await db.get(
      'SELECT id FROM enrollments WHERE group_id = ? AND student_id = ?',
      [normalizedId, student.id]
    );
    return Boolean(enrollment);
  }

  if (user.role_id === ROLE_PARENT) {
    const enrollment = await db.get(
      `SELECT e.id
       FROM parent_students ps
       INNER JOIN enrollments e ON e.student_id = ps.student_id
       WHERE ps.parent_user_id = ? AND ps.is_active = 1 AND e.group_id = ?
       LIMIT 1`,
      [user.id, normalizedId]
    );
    return Boolean(enrollment);
  }

  return false;
}

module.exports = {
  ROLE_ADMIN,
  ROLE_PARENT,
  ROLE_STUDENT,
  ROLE_TEACHER,
  getStudentForUser,
  getTeacherForUser,
  canAccessStudent,
  canAccessGroup,
};
