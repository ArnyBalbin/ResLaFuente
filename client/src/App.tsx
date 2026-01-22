import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import UsuariosPage from './pages/admin/usuarios/UsuariosPage';
import CategoriasPage from './pages/admin/categorias/CategoriasPage';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/dashboard/HomePage';
import ProfilePage from './pages/dashboard/ProfilePage';
import DashboardLayout from './layouts/DashboardLayout';

const PosPage = () => <div><h1>Punto de Venta (POS)</h1></div>;

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
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/categorias" element={<CategoriasPage />} />
            <Route path="/pos" element={<PosPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;