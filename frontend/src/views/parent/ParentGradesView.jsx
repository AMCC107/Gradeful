import { useParentStudent } from '../../contexts/ParentStudentContext';
import ViewingStudentBanner from './ViewingStudentBanner';
import StudentGradesView from '../portal/student/StudentGradesView';

function ParentGradesView() {
  const { selectedStudent } = useParentStudent();

  return (
    <div className="flex flex-col gap-6">
      <ViewingStudentBanner studentName={selectedStudent?.name} />
      <StudentGradesView
        key={selectedStudent?.id}
        studentId={selectedStudent?.id}
        studentName={selectedStudent?.name}
        programLabel={selectedStudent?.program}
        eyebrow="Portal de padres"
        readOnly
      />
    </div>
  );
}

export default ParentGradesView;
