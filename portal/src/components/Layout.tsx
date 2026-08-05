import { NavLink, useNavigate } from 'react-router-dom';
import { type ReactNode } from 'react';

const NAV = [
  { to: '/',           label: 'Dashboard' },
  { to: '/customers',  label: 'Customers'  },
  { to: '/licenses',   label: 'Licenses'   }
];

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('admin_token');
    void navigate('/login');
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-slate-800 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-700">
          <p className="text-white font-bold text-lg leading-tight">Gellsoft</p>
          <p className="text-slate-400 text-xs mt-0.5">License Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
