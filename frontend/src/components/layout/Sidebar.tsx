import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Calendar,
  UserPlus,
  Target,
  Users,
  Settings,
  UserMinus,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
];

const crmItems: NavItem[] = [
  { to: '/leads', label: 'Leads', icon: UserPlus },
  { to: '/opportunities', label: 'Opportunities', icon: Target },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/ex-clients', label: 'Ex-clientes', icon: UserMinus },
];

const bottomItems: NavItem[] = [
  { to: '/settings', label: 'Settings', icon: Settings },
];

function Item({ to, label, icon: Icon }: NavItem) {
  return (
    <li>
      <NavLink
        to={to}
        end={to === '/'}
        title={label}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 justify-center group-hover:justify-start ${
            isActive
              ? 'bg-white text-slate-900 font-medium shadow-sm ring-1 ring-slate-200/70'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`
        }
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="hidden whitespace-nowrap group-hover:inline">{label}</span>
      </NavLink>
    </li>
  );
}

export function Sidebar() {
  return (
    <aside className="group flex w-16 flex-col overflow-hidden border-r border-slate-200 bg-slate-50 px-3 py-5 transition-[width] duration-500 ease-in-out hover:w-60">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2.5 justify-center group-hover:justify-start group-hover:px-3">
        <div className="h-7 w-7 shrink-0 rounded-md bg-slate-900" />
        <span className="hidden whitespace-nowrap text-sm font-semibold tracking-wide text-slate-900 group-hover:inline">
          DevCRM
        </span>
      </div>

      <nav className="flex-1 space-y-6">
        <ul className="space-y-0.5">
          {navItems.map((i) => <Item key={i.to} {...i} />)}
        </ul>

        <div>
          <p className="hidden whitespace-nowrap px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:block">
            CRM
          </p>
          <div className="my-2 border-t border-slate-200 group-hover:hidden" />
          <ul className="space-y-0.5">
            {crmItems.map((i) => <Item key={i.to} {...i} />)}
          </ul>
        </div>
      </nav>

      <ul className="space-y-0.5 border-t border-slate-200 pt-4">
        {bottomItems.map((i) => <Item key={i.to} {...i} />)}
      </ul>
    </aside>
  );
}
