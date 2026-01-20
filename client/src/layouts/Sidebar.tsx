import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import logo from '../assets/lafuente.png';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: ShoppingCart, label: 'Caja & Pedidos', to: '/pos' },
  { icon: UtensilsCrossed, label: 'Cocina', to: '/cocina' },
  { icon: Users, label: 'Clientes', to: '/clientes' },
  { icon: Settings, label: 'Configuración', to: '/config' },
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="w-64 bg-white text-slate-800 h-screen flex flex-col fixed left-0 top-0 border-r border-slate-200 shadow-sm z-50">
      
      {/* HEADER DEL SIDEBAR */}
      <div className="h-24 flex items-center justify-center border-b border-slate-100 p-4">
        <img 
          src={logo} 
          alt="La Fuente Logo" 
          className="h-full object-contain" 
        />
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-medium",
                isActive 
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? "text-blue-700" : "text-slate-400"} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
          onClick={logout}
        >
          <LogOut size={18} />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}