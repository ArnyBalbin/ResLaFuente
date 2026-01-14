import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '@/features/usuarios/usuarios.api';
import { toast } from 'sonner';

// Componentes UI
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, MoreHorizontal, User } from 'lucide-react';

export const UsuariosPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'MOZO' // Valor por defecto
  });

  // 1. CARGAR USUARIOS
  const { data: usuarios, isLoading } = useQuery({ 
    queryKey: ['usuarios'], 
    queryFn: obtenerUsuarios 
  });

  // 2. MUTACIÓN: CREAR O EDITAR
  const guardarMutation = useMutation({
    mutationFn: (datos: any) => {
      if (usuarioEditando) {
        return actualizarUsuario(usuarioEditando.id, datos);
      } else {
        return crearUsuario(datos);
      }
    },
    onSuccess: () => {
      toast.success(usuarioEditando ? 'Usuario actualizado' : 'Usuario creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] }); // Recargar tabla
      cerrarModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al guardar usuario');
    }
  });

  // 3. MUTACIÓN: ELIMINAR
  const eliminarMutation = useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: () => {
      toast.success('Usuario eliminado');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: () => toast.error('No se pudo eliminar el usuario')
  });

  // Funciones Auxiliares
  const cerrarModal = () => {
    setModalOpen(false);
    setUsuarioEditando(null);
    setFormData({ nombre: '', email: '', password: '', rol: 'MOZO' });
  };

  const abrirParaCrear = () => {
    setUsuarioEditando(null);
    setFormData({ nombre: '', email: '', password: '', rol: 'MOZO' });
    setModalOpen(true);
  };

  const abrirParaEditar = (usuario: any) => {
    setUsuarioEditando(usuario);
    setFormData({ 
      nombre: usuario.nombre, 
      email: usuario.email, 
      password: '', // La contraseña no se muestra por seguridad
      rol: usuario.rol 
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.nombre || !formData.email) return toast.warning('Nombre y Email son obligatorios');
    if (!usuarioEditando && !formData.password) return toast.warning('La contraseña es obligatoria para nuevos usuarios');

    // Limpiamos datos: Si password está vacía al editar, la quitamos del objeto
    const payload = { ...formData };
    if (usuarioEditando && !payload.password) {
      delete (payload as any).password;
    }

    guardarMutation.mutate(payload);
  };

  if (isLoading) return <div className="p-10 text-center">Cargando personal...</div>;

  return (
    <div className="space-y-6">
      
      {/* CABECERA */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestión de Personal</h2>
          <p className="text-slate-500">Administra quién tiene acceso al sistema.</p>
        </div>
        <Button onClick={abrirParaCrear} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus size={18} /> Nuevo Usuario
        </Button>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead>Rol Asignado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios?.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="bg-slate-100 p-2 rounded-full w-fit">
                    <User size={16} className="text-slate-500"/>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{u.nombre}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-bold border 
                    ${u.rol === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                      u.rol === 'COCINA' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                      u.rol === 'CAJERO' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {u.rol}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => abrirParaEditar(u)}>
                        <Pencil className="mr-2 h-4 w-4 text-slate-500"/> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                           if(confirm('¿Estás seguro de eliminar a este usuario?')) eliminarMutation.mutate(u.id)
                        }} 
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4"/> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL (CREAR / EDITAR) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{usuarioEditando ? 'Editar Usuario' : 'Registrar Nuevo Empleado'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input 
                id="nombre" 
                placeholder="Ej: Juan Perez" 
                value={formData.nombre} 
                onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico (Login)</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="mozo@lafuente.com" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Rol en el Sistema</Label>
              <Select 
                value={formData.rol} 
                onValueChange={(val) => setFormData({...formData, rol: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador (Acceso Total)</SelectItem>
                  <SelectItem value="MOZO">Mozo (Pedidos)</SelectItem>
                  <SelectItem value="CAJERO">Cajero (Cobros)</SelectItem>
                  <SelectItem value="COCINA">Cocina (Monitor)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña {usuarioEditando && <span className="text-xs text-slate-500 font-normal">(Dejar vacío para mantener actual)</span>}
              </Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            <Button onClick={handleSubmit} disabled={guardarMutation.isPending} className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
              {guardarMutation.isPending ? 'Guardando...' : (usuarioEditando ? 'Actualizar Datos' : 'Registrar Usuario')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};