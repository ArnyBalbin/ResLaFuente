import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Users, Layers, Briefcase, Coffee, LayoutDashboard, UtensilsCrossed, LogOut, DollarSign, History, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore(); // Traemos usuario y función logout

  return (
    <div className="min-h-screen w-full flex bg-slate-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-blue-900">La Fuente</h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">
            Rol: {user?.rol || 'Invitado'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">

          {['ADMIN'].includes(user?.rol || '') && (
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
              <PieChart size={20} />
              <span className="font-medium">Reportes</span>
            </Link>
          )}

          {['ADMIN'].includes(user?.rol || '') && (
            <>
              <div className="px-4 py-2 mt-6 mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Administración
              </div>

              <Link to="/admin/usuarios" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                <Users size={20} />
                <span className="font-medium">Usuarios</span>
              </Link>

              <Link to="/admin/clientes" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                <Briefcase size={18} /> 
                <span className="font-medium">Clientes / Empresas</span>
              </Link>

              <Link to="/admin/categorias" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                <Layers size={20} />
                <span className="font-medium">Categorías</span>
              </Link>

              <Link to="/admin/productos" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                <Coffee size={20} />
                <span className="font-medium">Productos</span>
              </Link>
            </>
          )}

          {['ADMIN', 'MOZO', 'CAJERO'].includes(user?.rol || '') && (
            <Link to="/mesas" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
              <LayoutDashboard size={20} />
              <span className="font-medium">Mesas & Pedidos</span>
            </Link>
          )}

          {['ADMIN', 'COCINA'].includes(user?.rol || '') && (
            <Link to="/cocina" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
              <UtensilsCrossed size={20} />
              <span className="font-medium">Monitor Cocina</span>
            </Link>
          )}

          {['ADMIN', 'CAJERO'].includes(user?.rol || '') && (
            <Link to="/caja" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
              <DollarSign size={20} />
              <span className="font-medium">Caja y Turnos</span>
            </Link>
          )}

          {['ADMIN'].includes(user?.rol || '') && (
            <Link to="/inventario" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
              <History size={20} />
              <span className="font-medium">Inventario</span>
            </Link>
          )}

        </nav>

        <div className="p-4 border-t border-slate-100">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut size={20} className="mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 transition-all">
        {/* Header móvil */}
        <header className="bg-white border-b border-slate-200 p-4 md:hidden flex justify-between items-center sticky top-0 z-20">
          <h1 className="font-bold text-blue-900">La Fuente</h1>
          <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">{user?.rol}</span>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
};