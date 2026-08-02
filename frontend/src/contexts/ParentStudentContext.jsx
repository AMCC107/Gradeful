import { createContext, useContext, useMemo, useState } from 'react';

export const MOCK_CHILDREN = [
  {
    id: 'child-1',
    name: 'Juan Pérez',
    matricula: 'EST-2025-0312',
    program: '4to Semestre · Ingeniería en Desarrollo de Software',
  },
  {
    id: 'child-2',
    name: 'Ana Pérez',
    matricula: 'EST-2024-0847',
    program: '6to Semestre · Ingeniería en Desarrollo de Software',
  },
];

export const GRADES_BY_STUDENT = {
  'child-1': [
    {
      code: 'MDS-101',
      subject: 'Modelado de Sistemas',
      teacher: 'Mtra. Elena Gómez',
      p1: 8.5,
      p2: 9.0,
      p3: 9.2,
      final: 8.9,
      status: 'Aprobado',
    },
    {
      code: 'ALG-102',
      subject: 'Fundamentos de Algoritmia',
      teacher: 'Mtro. Luis Torres',
      p1: 9.0,
      p2: 8.8,
      p3: 9.5,
      final: 9.1,
      status: 'Aprobado',
    },
    {
      code: 'CAL-103',
      subject: 'Cálculo Diferencial',
      teacher: 'Dr. Alejandro Ortega',
      p1: 7.5,
      p2: 8.0,
      p3: 8.2,
      final: 7.9,
      status: 'Aprobado',
    },
    {
      code: 'WEB-104',
      subject: 'Introducción al Desarrollo Web',
      teacher: 'Mtro. Fernando Castro',
      p1: 9.5,
      p2: 9.8,
      p3: 10.0,
      final: 9.8,
      status: 'Aprobado',
    },
  ],
  'child-2': [
    {
      code: 'DSW-301',
      subject: 'Desarrollo de Aplicaciones Web',
      teacher: 'Mtro. Fernando Castro',
      p1: 9.5,
      p2: 9.0,
      p3: 10.0,
      final: 9.5,
      status: 'Aprobado',
    },
    {
      code: 'BBD-302',
      subject: 'Bases de Datos II',
      teacher: 'Dra. Patricia Medina',
      p1: 8.5,
      p2: 8.8,
      p3: 9.0,
      final: 8.8,
      status: 'Aprobado',
    },
    {
      code: 'IA-303',
      subject: 'Inteligencia Artificial',
      teacher: 'Dr. Hugo Sánchez',
      p1: 10.0,
      p2: 10.0,
      p3: 10.0,
      final: 10.0,
      status: 'Aprobado',
    },
    {
      code: 'UIX-304',
      subject: 'Diseño de Interfaces (UX/UI)',
      teacher: 'Mtra. Elena Gómez',
      p1: 9.0,
      p2: 9.2,
      p3: 9.5,
      final: 9.2,
      status: 'Aprobado',
    },
    {
      code: 'PM-305',
      subject: 'Programación Móvil',
      teacher: 'Mtro. Luis Torres',
      p1: 8.8,
      p2: 9.0,
      p3: 9.2,
      final: 9.0,
      status: 'Aprobado',
    },
  ],
};

export const PAYMENTS_BY_STUDENT = {
  'child-1': {
    accountSummary: { currentBalance: 150, overdueCount: 0, upcomingCount: 1 },
    pendingCharges: [
      {
        id: 1,
        concept: 'Colegiatura Septiembre 2026',
        amount: 150,
        due: '15/09/2026',
        status: 'proximo',
      },
    ],
    paymentHistory: [
      {
        id: 1,
        concept: 'Colegiatura Agosto 2026',
        amount: 150,
        date: '11/08/2026',
        method: 'Transferencia SPEI',
        status: 'Pagado',
      },
      {
        id: 2,
        concept: 'Inscripción Feb-Jul 2026',
        amount: 300,
        date: '20/01/2026',
        method: 'Tarjeta Débito',
        status: 'Pagado',
      },
    ],
  },
  'child-2': {
    accountSummary: { currentBalance: 300, overdueCount: 1, upcomingCount: 1 },
    pendingCharges: [
      {
        id: 1,
        concept: 'Colegiatura Agosto 2026',
        amount: 150,
        due: '15/08/2026',
        status: 'vencido',
      },
      {
        id: 2,
        concept: 'Colegiatura Septiembre 2026',
        amount: 150,
        due: '15/09/2026',
        status: 'proximo',
      },
    ],
    paymentHistory: [
      {
        id: 1,
        concept: 'Colegiatura Julio 2026',
        amount: 150,
        date: '12/07/2026',
        method: 'Transferencia SPEI',
        status: 'Pagado',
      },
      {
        id: 2,
        concept: 'Colegiatura Junio 2026',
        amount: 150,
        date: '10/06/2026',
        method: 'Tarjeta Débito',
        status: 'Pagado',
      },
      {
        id: 3,
        concept: 'Inscripción Feb-Jul 2026',
        amount: 300,
        date: '28/01/2026',
        method: 'Transferencia SPEI',
        status: 'Pagado',
      },
    ],
  },
};

const ParentStudentContext = createContext(null);

export function ParentStudentProvider({ children, initialChildren = MOCK_CHILDREN }) {
  const [selectedStudentId, setSelectedStudentId] = useState(initialChildren[0]?.id ?? null);

  const value = useMemo(() => {
    const selectedStudent =
      initialChildren.find((child) => child.id === selectedStudentId) ?? initialChildren[0] ?? null;

    return {
      students: initialChildren,
      selectedStudentId: selectedStudent?.id ?? null,
      selectedStudent,
      setSelectedStudentId,
    };
  }, [initialChildren, selectedStudentId]);

  return (
    <ParentStudentContext.Provider value={value}>
      {children}
    </ParentStudentContext.Provider>
  );
}

export function useParentStudent() {
  const context = useContext(ParentStudentContext);
  if (!context) {
    throw new Error('useParentStudent debe usarse dentro de ParentStudentProvider');
  }
  return context;
}
