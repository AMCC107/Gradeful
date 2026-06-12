import { NavLink } from 'react-router-dom';
import { LOGOUT_ITEM } from '../../../models/navigation.model';

const linkClass = ({ isActive }) =>
  [
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');

const iconClass = (isActive) =>
  [
    'size-5 shrink-0 transition-colors duration-200',
    isActive
      ? 'text-brand-600'
      : 'text-slate-400 group-hover:text-slate-600',
  ].join(' ');

function SidebarNavView({ navItems, onNavigate, onLogout }) {
  return (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Navegación principal">
      {navItems.map(({ id, label, path, icon: Icon, end }) => (
        <NavLink
          key={id}
          to={path}
          end={end}
          className={linkClass}
          onClick={onNavigate}
        >
          {({ isActive }) => (
            <>
              <Icon className={iconClass(isActive)} strokeWidth={isActive ? 2.25 : 2} />
              <span className={isActive ? 'font-semibold' : ''}>{label}</span>
            </>
          )}
        </NavLink>
      ))}

      <div className="mt-auto border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onLogout();
          }}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
        >
          <LOGOUT_ITEM.icon
            className="size-5 shrink-0 text-slate-400 transition-colors group-hover:text-red-500"
            strokeWidth={2}
          />
          {LOGOUT_ITEM.label}
        </button>
      </div>
    </nav>
  );
}

export default SidebarNavView;
