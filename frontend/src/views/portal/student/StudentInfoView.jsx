import { getUserProfile } from '../../../models/auth.model';
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, ShieldCheck, Heart } from 'lucide-react';

function StudentInfoView() {
  const user = getUserProfile();

  const personalInfo = [
    { label: 'Nombre Completo', value: user?.name || 'María González', icon: User },
    { label: 'Correo Institucional', value: user?.email || 'maria@gradeful.edu', icon: Mail },
    { label: 'Teléfono', value: '+52 (55) 5555-0199', icon: Phone },
    { label: 'Fecha de Nacimiento', value: '14 de Octubre de 2003', icon: Calendar },
    { label: 'Dirección', value: 'Av. Universidad #1200, Ciudad de México', icon: MapPin },
  ];

  const academicInfo = [
    { label: 'Matrícula', value: user?.displayId || 'EST-2024-0847', icon: ShieldCheck },
    { label: 'Carrera', value: 'Ingeniería en Desarrollo de Software', icon: GraduationCap },
    { label: 'Semestre Actual', value: '6to Semestre', icon: Calendar },
    { label: 'Estatus Académico', value: 'Regular / Activo', icon: Heart },
    { label: 'Tutor Académico', value: 'Dr. Alejandro Ortega', icon: User },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Profile Card */}
      <div className="flex flex-col md:flex-row gap-6 items-center p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-bold text-white shadow-md shadow-indigo-500/20">
          MG
        </div>
        <div className="text-center md:text-left space-y-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Estudiante Activo
          </span>
          <h1 className="text-2xl font-bold text-slate-900 pt-1">{user?.name || 'María González'}</h1>
          <p className="text-sm text-slate-500">Programa de Licenciatura e Ingeniería</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Details Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <User className="size-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Datos Personales</h2>
          </div>
          <div className="space-y-4">
            {personalInfo.map((info, index) => {
              const IconComp = info.icon;
              return (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 mt-0.5">
                    <IconComp className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{info.label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-snug">{info.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Details Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <GraduationCap className="size-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Perfil Académico</h2>
          </div>
          <div className="space-y-4">
            {academicInfo.map((info, index) => {
              const IconComp = info.icon;
              return (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 mt-0.5">
                    <IconComp className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{info.label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-snug">{info.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentInfoView;
