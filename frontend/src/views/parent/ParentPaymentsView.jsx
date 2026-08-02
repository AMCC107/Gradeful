import { useParentStudent } from '../../contexts/ParentStudentContext';
import ViewingStudentBanner from './ViewingStudentBanner';
import StudentPaymentsView from '../portal/student/StudentPaymentsView';

function ParentPaymentsView() {
  const { selectedStudent } = useParentStudent();

  return (
    <div className="flex flex-col gap-6">
      <ViewingStudentBanner studentName={selectedStudent?.name} />
      <StudentPaymentsView
        key={selectedStudent?.id}
        studentId={selectedStudent?.id}
        eyebrow="Portal de padres"
        readOnly
      />
    </div>
  );
}

export default ParentPaymentsView;
