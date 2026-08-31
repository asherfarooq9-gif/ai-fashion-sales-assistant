import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  Users,
  Package,
  MessagesSquare,
  GraduationCap,
  Download,
  Bot,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Shirt },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/conversations', label: 'Conversations', icon: MessagesSquare },
  { to: '/ai-training', label: 'AI Training', icon: GraduationCap },
  { to: '/export', label: 'Export', icon: Download },
  { to: '/simulator', label: 'Chat Simulator', icon: Bot },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r border-black/10 bg-white">
        <div className="px-5 py-6">
          <p className="font-display text-xl text-blush-700">FashionHub</p>
          <p className="text-xs text-black/40">AI Sales Assistant</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  isActive ? 'bg-blush-50 font-medium text-blush-700' : 'text-black/60 hover:bg-black/5'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-black/10 p-3">
          <p className="px-2 text-xs text-black/40">{admin?.email}</p>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-black/60 hover:bg-black/5"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden px-8 py-7">
        <Outlet />
      </main>
    </div>
  );
}
