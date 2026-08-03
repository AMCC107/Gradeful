const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const rolesRoutes = require('./routes/roles.routes');
const profileRoutes = require('./routes/profile.routes');
const studentsRoutes = require('./routes/students.routes');
const teachersRoutes = require('./routes/teachers.routes');
const subjectsRoutes = require('./routes/subjects.routes');
const coursesRoutes = require('./routes/courses.routes');
const groupsRoutes = require('./routes/groups.routes');
const enrollmentsRoutes = require('./routes/enrollments.routes');
const activitiesRoutes = require('./routes/activities.routes');
const schoolCyclesRoutes = require('./routes/schoolCycles.routes');
const gradesRoutes = require('./routes/grades.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const paymentsRoutes = require('./routes/payments.routes');
const parentsRoutes = require('./routes/parents.routes');
const reportsRoutes = require('./routes/reports.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.get('/api/status', (_req, res) => {
  res.json({ status: 'ok', message: 'El backend con Express está funcionando.' });
});

app.get('/api/health', async (_req, res) => {
  try {
    const db = await require('./config/database').getDb();
    await db.get('SELECT 1 AS healthy');
    return res.json({ status: 'healthy', database: 'ready' });
  } catch {
    return res.status(503).json({ status: 'unhealthy', database: 'unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/school-cycles', schoolCyclesRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/parents', parentsRoutes);
app.use('/api/reports', reportsRoutes);

app.use((error, _req, res, _next) => {
  if (error?.name === 'MulterError' || error?.message === 'Tipo de archivo no permitido.') {
    return res.status(400).json({ message: error.message });
  }
  console.error('Unhandled request error:', error);
  return res.status(500).json({ message: 'Error interno del servidor.' });
});

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { app, start };
