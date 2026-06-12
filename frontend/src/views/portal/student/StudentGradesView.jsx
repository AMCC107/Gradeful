import { useState } from 'react';
import { GraduationCap, TrendingUp, CheckCircle, Percent } from 'lucide-react';

function StudentGradesView() {
  const [selectedSemester, setSelectedSemester] = useState('6to');

  const semesters = [
    { value: '6to', label: '6to Semestre (Ciclo Primavera 2026)' },
    { value: '5to', label: '5to Semestre (Ciclo Otoño 2025)' },
    { value: '4to', label: '4to Semestre (Ciclo Primavera 2025)' },
  ];

  const gradesData = {
    '6to': [
      { code: 'DSW-301', subject: 'Desarrollo de Aplicaciones Web', teacher: 'Mtro. Fernando Castro', p1: 9.5, p2: 9.0, p3: 10.0, final: 9.5 },
      { code: 'BBD-302', subject: 'Bases de Datos II', teacher: 'Dra. Patricia Medina', p1: 8.5, p2: 8.8, p3: 9.0, final: 8.8 },
      { code: 'IA-303', subject: 'Inteligencia Artificial', teacher: 'Dr. Hugo Sánchez', p1: 10.0, p2: 10.0, p3: 10.0, final: 10.0 },
      { code: 'UIX-304', subject: 'Diseño de Interfaces (UX/UI)', teacher: 'Mtra. Elena Gómez', p1: 9.0, p2: 9.2, p3: 9.5, final: 9.2 },
      { code: 'PM-305', subject: 'Programación Móvil', teacher: 'Mtro. Luis Torres', p1: 8.8, p2: 9.0, p3: 9.2, final: 9.0 },
    ],
    '5to': [
      { code: 'ARC-201', subject: 'Arquitectura de Software', teacher: 'Dr. Hugo Sánchez', p1: 9.0, p2: 9.0, p3: 9.0, final: 9.0 },
      { code: 'POO-202', subject: 'Prog. Orientada a Objetos II', teacher: 'Mtro. Fernando Castro', p1: 9.2, p2: 9.5, p3: 9.5, final: 9.4 },
      { code: 'RED-203', subject: 'Redes de Computadoras', teacher: 'Ing. Carlos Ortiz', p1: 8.0, p2: 8.5, p3: 9.0, final: 8.5 },
      { code: 'EST-204', subject: 'Estructuras de Datos', teacher: 'Dra. Patricia Medina', p1: 9.5, p2: 9.8, p3: 10.0, final: 9.8 },
    ],
    '4to': [
      { code: 'MDS-101', subject: 'Modelado de Sistemas', teacher: 'Mtra. Elena Gómez', p1: 8.5, p2: 9.0, p3: 9.2, final: 8.9 },
      { code: 'ALG-102', subject: 'Fundamentos de Algoritmia', teacher: 'Mtro. Luis Torres', p1: 9.5, p2: 9.5, p3: 9.8, final: 9.6 },
      { code: 'CAL-103', subject: 'Cálculo Diferencial', teacher: 'Dr. Alejandro Ortega', p1: 8.0, p2: 8.0, p3: 8.5, final: 8.2 },
      { code: 'WEB-104', subject: 'Introducción al Desarrollo Web', teacher: 'Mtro. Fernando Castro', p1: 10.0, p2: 10.0, p3: 10.0, final: 10.0 },
    ],
  };

  const currentGrades = gradesData[selectedSemester] || [];
  const average = (currentGrades.reduce((sum, item) => sum + item.final, 0) / currentGrades.length).toFixed(1);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Boleta de Calificaciones</h1>
          <p className="text-sm text-slate-500">Consulta tu historial de notas parciales y finales</p>
        </div>
        <div className="w-full sm:w-72">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
          >
            {semesters.map((sem) => (
              <option key={sem.value} value={sem.value}>
                {sem.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI stats for Grades */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Promedio del Ciclo</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{average}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Materias Aprobadas</p>
              <h3 className="mt-1 text-2xl font-bold text-emerald-700">{currentGrades.length} / {currentGrades.length}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Créditos Obtenidos</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{currentGrades.length * 8} / {currentGrades.length * 8}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <GraduationCap className="size-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Clave</th>
                <th className="px-6 py-4">Asignatura</th>
                <th className="px-6 py-4">Docente</th>
                <th className="px-6 py-4 text-center">Parcial 1</th>
                <th className="px-6 py-4 text-center">Parcial 2</th>
                <th className="px-6 py-4 text-center">Parcial 3</th>
                <th className="px-6 py-4 text-center">Final</th>
                <th className="px-6 py-4 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentGrades.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-slate-400">{row.code}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{row.subject}</td>
                  <td className="px-6 py-4 text-slate-500">{row.teacher}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-700">{row.p1.toFixed(1)}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-700">{row.p2.toFixed(1)}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-700">{row.p3.toFixed(1)}</td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">{row.final.toFixed(1)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      Aprobado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentGradesView;
