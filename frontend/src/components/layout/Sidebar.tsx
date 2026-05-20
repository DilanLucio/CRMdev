import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
];

const crmItems = [
  { to: '/leads', label: 'Leads', icon: '🎯' },
  { to: '/opportunities', label: 'Opportunities', icon: '💼' },
  { to: '/contacts', label: 'Contacts', icon: '👥' },
];

const bottomItems = [
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

function Item({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <li>
      <NavLink
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-150 ${
            isActive
              ? 'bg-slate-800/50 text-white border-l-2 border-emerald-500'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
          }`
        }
      >
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </NavLink>
    </li>
  );
}

export function Sidebar() {
  return (
    <aside className="flex w-64 flex-col bg-slate-900 px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="h-8 w-8 rounded-lg bg-emerald-500" />
        <span className="text-lg font-bold text-white">DevCRM</span>
      </div>

      <nav className="flex-1 space-y-6">
        <ul className="space-y-1">
          {navItems.map((i) => <Item key={i.to} {...i} />)}
        </ul>

        <div>
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            CRM
          </p>
          <ul className="space-y-1">
            {crmItems.map((i) => <Item key={i.to} {...i} />)}
          </ul>
        </div>
      </nav>

      <ul className="space-y-1">
        {bottomItems.map((i) => <Item key={i.to} {...i} />)}
      </ul>
    </aside>
  );
}
