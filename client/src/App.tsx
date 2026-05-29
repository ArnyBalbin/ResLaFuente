import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import CategoriasPage from './pages/admin/categorias/CategoriasPage';
import ProductosPage from './pages/admin/productos/ProductosPage';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/dashboard/HomePage';
import ProfilePage from './pages/dashboard/ProfilePage';
import DashboardLayout from './layouts/DashboardLayout';
import PosPage from './pages/pos/PosPage';
import CocinaPage from './pages/cocina/CocinaPage'; 
import ClientesPage from './pages/clientes/ClientesPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<DashboardLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/categorias" element={<CategoriasPage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/pos" element={<PosPage />} />
            <Route path="/cocina" element={<CocinaPage />} /> {}
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
