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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.get('/api/status', (_req, res) => {
  res.json({ message: '¡El backend con Express está funcionando!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/courses', coursesRoutes);

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

start();
