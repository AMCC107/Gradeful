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

async function ensureColumn(db, table, column, definition) {
  if (!(await columnExists(db, table, column))) {
    await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function ensureUsersRoleColumn(db) {
  await ensureColumn(db, 'users', 'role_id', 'INTEGER NOT NULL DEFAULT 3');
}

async function ensureAcademicColumns(db) {
  await ensureColumn(db, 'subjects', 'clave', 'TEXT');
  await ensureColumn(db, 'groups', 'nombre', "TEXT NOT NULL DEFAULT 'A'");
  await ensureColumn(db, 'groups', 'turno', "TEXT NOT NULL DEFAULT 'matutino'");
  await ensureColumn(db, 'groups', 'school_cycle_id', 'INTEGER');
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
    { nombre: 'gestionar_ciclos', descripcion: 'Administrar ciclos escolares y periodos' },
    { nombre: 'gestionar_calificaciones', descripcion: 'Registrar calificaciones de alumnos' },
    { nombre: 'gestionar_asistencias', descripcion: 'Registrar asistencia y revisar justificantes' },
    { nombre: 'justificar_inasistencias', descripcion: 'Adjuntar justificantes de inasistencia' },
    { nombre: 'ver_pagos', descripcion: 'Consultar estado de cuenta y pagos' },
    { nombre: 'gestionar_reportes', descripcion: 'Consultar y exportar reportes institucionales' },
    { nombre: 'importar_alumnos', descripcion: 'Importar alumnos desde Excel' },
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
    2: [
      'ver_perfil',
      'editar_perfil',
      'ver_calificaciones',
      'ver_pagos',
      'justificar_inasistencias',
    ],
    3: [
      'ver_perfil',
      'editar_perfil',
      'ver_calificaciones',
      'ver_actividades',
      'ver_pagos',
      'justificar_inasistencias',
    ],
    4: [
      'ver_perfil',
      'editar_perfil',
      'ver_calificaciones',
      'editar_calificaciones',
      'gestionar_calificaciones',
      'gestionar_asistencias',
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

async function seedAcademicDefaults(db) {
  await db.run(
    `INSERT OR IGNORE INTO school_cycles
      (id, nombre, fecha_inicio, fecha_fin, is_active)
     VALUES (1, '2026-2027', '2026-08-01', '2027-07-31', 1)`
  );

  const periods = [
    [1, 'Parcial 1', 1, '2026-08-01', '2026-10-31'],
    [1, 'Parcial 2', 2, '2026-11-01', '2027-02-28'],
    [1, 'Parcial 3', 3, '2027-03-01', '2027-06-30'],
  ];
  for (const period of periods) {
    await db.run(
      `INSERT OR IGNORE INTO academic_periods
        (school_cycle_id, nombre, numero, fecha_inicio, fecha_fin, ponderacion)
       VALUES (?, ?, ?, ?, ?, 33.3333)`,
      period
    );
  }

  await db.run(
    `INSERT OR IGNORE INTO institutional_settings
      (id, nombre_institucion, direccion, telefono, correo, pie_boleta)
     VALUES (1, 'Gradeful', '', '', '', 'Documento generado por Gradeful')`
  );

  const studentUser = await db.get(
    "SELECT id FROM users WHERE correo = 'maria@gradeful.edu'"
  );
  const parentUser = await db.get(
    "SELECT id FROM users WHERE correo = 'carlos.gonzalez@mail.com'"
  );
  const teacherUser = await db.get(
    "SELECT id FROM users WHERE correo = 'laura.mendez@gradeful.edu'"
  );

  if (studentUser) {
    await db.run(
      `INSERT OR IGNORE INTO students (user_id, matricula, is_active)
       VALUES (?, 'EST-2026-0001', 1)`,
      [studentUser.id]
    );
  }
  if (teacherUser) {
    await db.run(
      `INSERT OR IGNORE INTO teachers (user_id, numero_empleado, especialidad, is_active)
       VALUES (?, 'DOC-001', 'Docencia general', 1)`,
      [teacherUser.id]
    );
  }

  const student = studentUser
    ? await db.get('SELECT id FROM students WHERE user_id = ?', [studentUser.id])
    : null;
  if (parentUser && student) {
    await db.run(
      `INSERT OR IGNORE INTO parent_students
        (parent_user_id, student_id, parentesco, is_active)
       VALUES (?, ?, 'Padre/Tutor', 1)`,
      [parentUser.id, student.id]
    );
  }

  const concepts = [
    ['Colegiatura mensual', 'colegiatura', 1500, 1],
    ['Inscripción', 'inscripcion', 3000, 0],
    ['Concepto adicional', 'adicional', 0, 0],
  ];
  for (const concept of concepts) {
    await db.run(
      `INSERT OR IGNORE INTO payment_concepts (nombre, tipo, monto_base, recurrente, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      concept
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
  await db.exec('PRAGMA journal_mode = WAL');
  await db.exec('PRAGMA synchronous = NORMAL');
  await db.exec('PRAGMA busy_timeout = 5000');

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

    CREATE TABLE IF NOT EXISTS school_cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      CHECK (fecha_fin >= fecha_inicio)
    );

    CREATE TABLE IF NOT EXISTS academic_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_cycle_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      numero INTEGER NOT NULL CHECK (numero BETWEEN 1 AND 10),
      fecha_inicio TEXT,
      fecha_fin TEXT,
      ponderacion REAL NOT NULL DEFAULT 0 CHECK (ponderacion >= 0),
      UNIQUE (school_cycle_id, numero),
      FOREIGN KEY (school_cycle_id) REFERENCES school_cycles(id) ON DELETE CASCADE
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
      clave TEXT UNIQUE,
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
      school_cycle_id INTEGER,
      nombre TEXT NOT NULL DEFAULT 'A',
      turno TEXT NOT NULL DEFAULT 'matutino' CHECK (turno IN ('matutino', 'vespertino', 'nocturno', 'mixto')),
      capacidad_maxima INTEGER NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id),
      FOREIGN KEY (school_cycle_id) REFERENCES school_cycles(id)
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

    CREATE TABLE IF NOT EXISTS parent_students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_user_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      parentesco TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      UNIQUE (parent_user_id, student_id),
      FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      period_id INTEGER NOT NULL,
      calificacion REAL NOT NULL CHECK (calificacion BETWEEN 0 AND 10),
      observaciones TEXT,
      recorded_by_user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (group_id, student_id, period_id),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (period_id) REFERENCES academic_periods(id),
      FOREIGN KEY (recorded_by_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      estado TEXT NOT NULL CHECK (estado IN ('presente', 'ausente', 'retardo')),
      recorded_by_user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (group_id, student_id, fecha),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (recorded_by_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS attendance_justifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attendance_id INTEGER NOT NULL UNIQUE,
      motivo TEXT NOT NULL,
      document_path TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      submitted_by_user_id INTEGER NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
      reviewed_by_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at TEXT,
      FOREIGN KEY (attendance_id) REFERENCES attendance_records(id) ON DELETE CASCADE,
      FOREIGN KEY (submitted_by_user_id) REFERENCES users(id),
      FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS payment_concepts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      tipo TEXT NOT NULL CHECK (tipo IN ('colegiatura', 'inscripcion', 'adicional')),
      monto_base REAL NOT NULL DEFAULT 0 CHECK (monto_base >= 0),
      recurrente INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS student_charges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      concept_id INTEGER NOT NULL,
      school_cycle_id INTEGER,
      descripcion TEXT,
      monto REAL NOT NULL CHECK (monto >= 0),
      fecha_vencimiento TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (concept_id) REFERENCES payment_concepts(id),
      FOREIGN KEY (school_cycle_id) REFERENCES school_cycles(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      charge_id INTEGER,
      monto REAL NOT NULL CHECK (monto > 0),
      fecha_pago TEXT NOT NULL DEFAULT (datetime('now')),
      metodo TEXT NOT NULL,
      referencia TEXT,
      estado TEXT NOT NULL DEFAULT 'confirmado' CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
      recorded_by_user_id INTEGER NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (charge_id) REFERENCES student_charges(id),
      FOREIGN KEY (recorded_by_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS payment_proofs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      charge_id INTEGER,
      document_path TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      submitted_by_user_id INTEGER NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (charge_id) REFERENCES student_charges(id),
      FOREIGN KEY (submitted_by_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS institutional_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      nombre_institucion TEXT NOT NULL,
      logo_path TEXT,
      direccion TEXT,
      telefono TEXT,
      correo TEXT,
      pie_boleta TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
    CREATE INDEX IF NOT EXISTS idx_groups_teacher ON groups(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id, period_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, fecha);
    CREATE INDEX IF NOT EXISTS idx_charges_student_due ON student_charges(student_id, fecha_vencimiento);
    CREATE INDEX IF NOT EXISTS idx_payments_student_date ON payments(student_id, fecha_pago);
  `);

  await seedRolesAndPermissions(db);
  await ensureUsersRoleColumn(db);
  await ensureAcademicColumns(db);
  await seedDemoUsers(db);
  await seedAcademicDefaults(db);

  console.log(`SQLite listo en: ${DB_PATH}`);
  return db;
}

module.exports = { getDb, initDatabase, DB_PATH };
