import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useAuthStore } from '../store/authStore';


export default function DashboardLayout() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-muted/20">

      <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      <div className="md:ml-64 flex flex-col min-h-screen transition-all duration-300">
        
        <Header />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-6xl animate-fade-in">
             <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
}