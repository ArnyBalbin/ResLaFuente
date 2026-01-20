import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';

import DashboardLayout from './layouts/DashboardLayout';

const LoginPage = () => <div className="flex h-screen items-center justify-center"><h1>Login Page</h1></div>;
const HomePage = () => <div><h1>Bienvenido al Dashboard</h1></div>;
const PosPage = () => <div><h1>Punto de Venta (POS)</h1></div>;

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas Protegidas (Dashboard) */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/pos" element={<PosPage />} />
            {/* Agrega más rutas aquí */}
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;