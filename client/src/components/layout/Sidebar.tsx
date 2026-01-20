import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Package,
  Layers,
  ClipboardList,
  Briefcase,
  UserCircle, 
  FileBarChart
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import logo from '../../assets/lafuente.png';
import type { Rol } from '../../types';

interface MenuItem {
  icon: any;
  label: string;
  to: string;
  roles: Rol[];
}

const menuItems: MenuItem[] = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    to: '/', 
    roles: ['ADMIN', 'MOZO', 'CAJA'] 
  },
  { 
    icon: ShoppingCart, 
    label: 'Punto de Venta', 
    to: '/pos', 
    roles: ['ADMIN', 'MOZO', 'CAJA'] 
  },
  { 
    icon: UtensilsCrossed, 
    label: 'Comandas Cocina', 
    to: '/cocina', 
    roles: ['ADMIN', 'COCINA'] 
  },

  { 
    icon: Package, 
    label: 'Productos', 
    to: '/productos', 
    roles: ['ADMIN'] 
  },
  { 
    icon: Layers, 
    label: 'Categorías', 
    to: '/categorias', 
    roles: ['ADMIN'] 
  },
  { 
    icon: ClipboardList, 
    label: 'Inventario', 
    to: '/inventario', 
    roles: ['ADMIN']
  },

  { 
    icon: UserCircle, 
    label: 'Clientes', 
    to: '/clientes', 
    roles: ['ADMIN', 'MOZO', 'CAJA'] 
  },
  { 
    icon: Briefcase, 
    label: 'Empresas', 
    to: '/empresas', 
    roles: ['ADMIN', 'CAJA'] 
  },

  { 
    icon: Users, 
    label: 'Personal', 
    to: '/usuarios', 
    roles: ['ADMIN']
  },
  { 
    icon: FileBarChart, 
    label: 'Reportes', 
    to: '/reportes', 
    roles: ['ADMIN'] 
  },
  { 
    icon: Settings, 
    label: 'Configuración', 
    to: '/config', 
    roles: ['ADMIN'] 
  }
];

export function Sidebar() {
  const { logout, usuario } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const filteredMenuItems = menuItems.filter(item => 
    usuario?.rol && item.roles.includes(usuario.rol)
  );

  return (
    <aside className="w-64 bg-white text-slate-800 h-screen flex flex-col fixed left-0 top-0 border-r border-slate-200 shadow-sm z-50">

      <div className="h-24 flex items-center justify-center border-b border-slate-100 p-4 bg-white">
        <img 
          src={logo} 
          alt="La Fuente Logo" 
          className="h-full object-contain"
        />
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-medium",
                isActive 
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={cn(
                  "transition-colors",
                  isActive ? "text-blue-700" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}

      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/50 gap-2"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}