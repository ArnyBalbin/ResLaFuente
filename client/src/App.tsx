import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { TomarPedidoPage } from '@/pages/TomarPedidoPage';
import { MesasPage } from '@/pages/MesasPage';
import { CocinaPage } from '@/pages/CocinaPage';
import { LoginPage } from '@/pages/LoginPage';
import { CajaPage } from '@/pages/CajaPage';
import { UsuariosPage } from '@/pages/admin/UsuariosPage';
import { CategoriasPage } from '@/pages/admin/CategoriasPage';
import { ProductosPage } from '@/pages/admin/ProductosPage';
import { ClientesPage } from '@/pages/admin/ClientesPage';
import { InventarioPage } from './pages/InventarioPage';
import { DashboardPage } from '@/pages/DashboardPage';

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/mesas" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="admin/usuarios" element={<UsuariosPage />} />
              <Route path="admin/clientes" element={<ClientesPage />} />
              <Route path="admin/categorias" element={<CategoriasPage />} />
              <Route path="admin/productos" element={<ProductosPage />} />
              <Route path="mesas" element={<MesasPage />} />
              <Route path="tomar-pedido" element={<TomarPedidoPage />} />
              <Route path="cocina" element={<CocinaPage />} />
              <Route path="caja" element={<CajaPage />} />
              <Route path="inventario" element={<InventarioPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}

export default App;