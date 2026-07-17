const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'gradeful.db');

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });
  }
  return dbPromise;
}

async function columnExists(db, table, column) {
  const rows = await db.all(`PRAGMA table_info(${table})`);
  return rows.some((row) => row.name === column);
}

async function ensureUsersRoleColumn(db) {
  const hasRoleId = await columnExists(db, 'users', 'role_id');
  if (!hasRoleId) {
    await db.exec(`ALTER TABLE users ADD COLUMN role_id INTEGER NOT NULL DEFAULT 3`);
  }
}

async function seedRolesAndPermissions(db) {
  const roles = [
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso completo al panel de dirección' },
    { id: 2, nombre: 'Padre', descripcion: 'Consulta de calificaciones y pagos de tutores' },
    { id: 3, nombre: 'Estudiante', descripcion: 'Acceso al portal estudiantil' },
    { id: 4, nombre: 'Profesor', descripcion: 'Docente con grupos, actividades y tareas' },
  ];

  for (const role of roles) {
    await db.run(
      `INSERT OR IGNORE INTO roles (id, nombre, descripcion) VALUES (?, ?, ?)`,
      [role.id, role.nombre, role.descripcion]
    );
  }

  const permissions = [
    { nombre: 'crear_usuario', descripcion: 'Crear usuarios del sistema' },
    { nombre: 'editar_usuario', descripcion: 'Editar usuarios del sistema' },
    { nombre: 'desactivar_usuario', descripcion: 'Desactivar usuarios (soft delete)' },
    { nombre: 'gestionar_roles', descripcion: 'Crear y editar roles y permisos' },
    { nombre: 'editar_calificaciones', descripcion: 'Registrar o modificar calificaciones' },
    { nombre: 'ver_calificaciones', descripcion: 'Consultar calificaciones' },
    { nombre: 'gestionar_pagos', descripcion: 'Administrar tesorería y pagos' },
    { nombre: 'ver_perfil', descripcion: 'Ver el perfil propio' },
    { nombre: 'editar_perfil', descripcion: 'Actualizar el perfil propio' },
    { nombre: 'gestionar_alumnos', descripcion: 'CRUD de alumnos' },
    { nombre: 'gestionar_profesores', descripcion: 'CRUD de profesores' },
    { nombre: 'gestionar_materias', descripcion: 'CRUD de materias' },
    { nombre: 'gestionar_cursos', descripcion: 'CRUD de cursos' },
    { nombre: 'gestionar_grupos', descripcion: 'CRUD de grupos académicos' },
    { nombre: 'gestionar_inscripciones', descripcion: 'Inscribir alumnos a grupos' },
    { nombre: 'gestionar_actividades', descripcion: 'Crear y editar actividades/tareas de grupos' },
    { nombre: 'ver_actividades', descripcion: 'Consultar actividades y tareas asignadas' },
  ];

  for (const permission of permissions) {
    await db.run(
      `INSERT OR IGNORE INTO permissions (nombre, descripcion) VALUES (?, ?)`,
      [permission.nombre, permission.descripcion]
    );
  }

  const allPermissions = await db.all('SELECT id, nombre FROM permissions');
  const byName = Object.fromEntries(allPermissions.map((p) => [p.nombre, p.id]));

  const rolePermissionMap = {
    1: allPermissions.map((p) => p.nombre),
    2: ['ver_perfil', 'editar_perfil', 'ver_calificaciones', 'gestionar_pagos'],
    3: ['ver_perfil', 'editar_perfil', 'ver_calificaciones', 'ver_actividades'],
    4: [
      'ver_perfil',
      'editar_perfil',
      'ver_calificaciones',
      'editar_calificaciones',
      'gestionar_actividades',
      'ver_actividades',
    ],
  };

  for (const [roleId, names] of Object.entries(rolePermissionMap)) {
    for (const name of names) {
      const permissionId = byName[name];
      if (!permissionId) continue;
      await db.run(
        `INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
        [Number(roleId), permissionId]
      );
    }
  }
}

async function seedDemoUsers(db) {
  const demos = [
    {
      nombre: 'Lic. Roberto Pérez',
      correo: 'roberto.perez@gradeful.edu',
      password: 'admin123',
      role_id: 1,
    },
    {
      nombre: 'Carlos González',
      correo: 'carlos.gonzalez@mail.com',
      password: 'padre123',
      role_id: 2,
    },
    {
      nombre: 'María González',
      correo: 'maria@gradeful.edu',
      password: 'estudiante123',
      role_id: 3,
    },
    {
      nombre: 'Prof. Laura Méndez',
      correo: 'laura.mendez@gradeful.edu',
      password: 'profesor123',
      role_id: 4,
    },
  ];

  for (const demo of demos) {
    const existing = await db.get('SELECT id FROM users WHERE correo = ?', [demo.correo]);
    if (existing) {
      await db.run('UPDATE users SET role_id = ?, nombre = ? WHERE id = ?', [
        demo.role_id,
        demo.nombre,
        existing.id,
      ]);
      continue;
    }

    const hashed = await bcrypt.hash(demo.password, 10);
    await db.run(
      `INSERT INTO users (nombre, correo, contraseña, is_active, role_id)
       VALUES (?, ?, ?, 1, ?)`,
      [demo.nombre, demo.correo, hashed, demo.role_id]
    );
  }
}

async function initDatabase() {
  const dataDir = path.dirname(DB_PATH);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = await getDb();
  await db.exec('PRAGMA foreign_keys = ON');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL,
      permission_id INTEGER NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      contraseña TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      role_id INTEGER NOT NULL DEFAULT 3,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      matricula TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      numero_empleado TEXT NOT NULL UNIQUE,
      especialidad TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      nivel TEXT NOT NULL,
      UNIQUE (nombre, nivel)
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      capacidad_maxima INTEGER NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      fecha_inscripcion TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (group_id, student_id),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS activities_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      tipo TEXT NOT NULL CHECK (tipo IN ('actividad', 'tarea')),
      fecha_entrega TEXT NOT NULL,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );
  `);

  await seedRolesAndPermissions(db);
  await ensureUsersRoleColumn(db);
  await seedDemoUsers(db);

  console.log(`SQLite listo en: ${DB_PATH}`);
  return db;
}

module.exports = { getDb, initDatabase, DB_PATH };
