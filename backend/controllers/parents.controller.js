const { getDb } = require('../config/database');
const { ROLE_ADMIN } = require('../utils/access');

async function listChildren(req, res) {
  try {
    const parentUserId = req.user.role_id === ROLE_ADMIN && req.query.parent_user_id
      ? Number(req.query.parent_user_id)
      : req.user.id;
    const db = await getDb();
    const students = await db.all(
      `SELECT s.id, s.matricula, u.nombre AS name, ps.parentesco,
              c.nombre AS course_name, c.nivel AS course_level,
              g.nombre AS group_name, g.turno
       FROM parent_students ps
       INNER JOIN students s ON s.id = ps.student_id
       INNER JOIN users u ON u.id = s.user_id
       LEFT JOIN enrollments e ON e.student_id = s.id
       LEFT JOIN groups g ON g.id = e.group_id
       LEFT JOIN courses c ON c.id = g.course_id
       WHERE ps.parent_user_id = ? AND ps.is_active = 1 AND s.is_active = 1
       GROUP BY s.id ORDER BY u.nombre`,
      [parentUserId]
    );
    return res.json({
      students: students.map((student) => ({
        ...student,
        program: [student.course_name, student.course_level, student.group_name]
          .filter(Boolean)
          .join(' · '),
      })),
    });
  } catch (error) {
    console.error('listChildren:', error);
    return res.status(500).json({ message: 'Error al listar alumnos vinculados.' });
  }
}

async function linkChild(req, res) {
  try {
    const parentUserId = Number(req.body.parent_user_id);
    const studentId = Number(req.body.student_id);
    const db = await getDb();
    const parent = await db.get('SELECT id FROM users WHERE id = ? AND role_id = 2', [parentUserId]);
    const student = await db.get('SELECT id FROM students WHERE id = ?', [studentId]);
    if (!parent || !student) return res.status(400).json({ message: 'Padre o alumno inválido.' });
    await db.run(
      `INSERT INTO parent_students (parent_user_id, student_id, parentesco, is_active)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(parent_user_id, student_id) DO UPDATE SET
         parentesco = excluded.parentesco, is_active = 1`,
      [parentUserId, studentId, req.body.parentesco || null]
    );
    return res.status(201).json({ message: 'Alumno vinculado al tutor.' });
  } catch (error) {
    console.error('linkChild:', error);
    return res.status(500).json({ message: 'Error al vincular al alumno.' });
  }
}

module.exports = { listChildren, linkChild };
