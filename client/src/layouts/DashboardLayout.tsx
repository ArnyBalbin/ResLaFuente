import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, LogOut, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen w-full flex bg-slate-50">

      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-blue-900">La Fuente</h1>
          <p className="text-xs text-slate-500">Sistema de Gestión</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/mesas" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Mesas & Pedidos</span>
          </Link>

          <Link to="/cocina" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
            <UtensilsCrossed size={20} />
            <span className="font-medium">Cocina</span>
          </Link>

          <Link to="/caja" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
            <DollarSign size={20} />
            <span className="font-medium">Caja y Turnos</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut size={20} className="mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 transition-all">
        <header className="bg-white border-b border-slate-200 p-4 md:hidden flex justify-between items-center sticky top-0 z-20">
          <h1 className="font-bold text-blue-900">La Fuente</h1>
          <Button variant="outline" size="sm">Menú</Button>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
};
