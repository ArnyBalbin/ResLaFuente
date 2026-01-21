import { useLocation, Link } from 'react-router-dom';
import {
  Bell,
  Menu,
  LogOut,
  Settings,
  UserCircle,
  Search,
  ChevronRight,
  Slash
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const { usuario, logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // --- LÓGICA DE BREADCRUMBS (Migas de pan) ---
  // Convierte "/admin/usuarios" en ["Admin", "Usuarios"]
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Diccionario para nombres bonitos en la ruta
  const routeNames: Record<string, string> = {
    pos: 'Punto de Venta',
    cocina: 'Cocina',
    usuarios: 'Gestión de Usuarios',
    config: 'Configuración',
    clientes: 'Clientes',
    productos: 'Productos',
    categorias: 'Categorías',
    reportes: 'Reportes Financieros'
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 shadow-sm">

      {/* ================= ZONA IZQUIERDA: MÓVIL + BREADCRUMBS ================= */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">

        {/* Menú Hamburguesa (Solo Móvil) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden shrink-0 -ml-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Breadcrumbs (Solo Desktop) - Indica dónde estamos */}
        <nav className="hidden md:flex items-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors font-medium">
            Inicio
          </Link>
          {pathSegments.length > 0 && (
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
          )}
          {pathSegments.map((segment, index) => {
            const isLast = index === pathSegments.length - 1;
            const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

            return (
              <div key={segment} className="flex items-center">
                <span className={`font-medium ${isLast ? 'text-foreground' : 'hover:text-primary transition-colors'}`}>
                  {name}
                </span>
                {!isLast && <Slash className="h-3 w-3 mx-2 text-muted-foreground/40 -rotate-12" />}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ================= ZONA CENTRAL: BÚSQUEDA GLOBAL ================= */}
      <div className="flex-1 flex justify-center px-4">
        <div className="w-full max-w-lg relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pedido, plato o cliente... (Ctrl+K)"
            className="pl-9 bg-muted/40 border-muted focus:bg-background transition-all focus:ring-primary/20 rounded-full"
          />
          {/* Simulación de atajo de teclado */}
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* ================= ZONA DERECHA: ACCIONES ================= */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">

        {/* Búsqueda Móvil (Solo icono) */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notificaciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
              <Bell className="h-5 w-5" />
              {/* Puntito rojo si hay notificaciones */}
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-8 text-sm text-muted-foreground text-center flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
              <p>Estás al día. No hay alertas nuevas.</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menú de Usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all ml-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {getInitials(usuario?.nombre || 'U')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{usuario?.nombre}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {usuario?.email}
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-semibold text-primary">
                    {usuario?.rol}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/profile" className="flex items-center w-full">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer group">
              <Settings className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer bg-red-50/50 focus:bg-red-100"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}