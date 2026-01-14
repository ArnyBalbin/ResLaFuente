import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '@/features/usuarios/usuarios.api';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const UsuariosPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null); // Usuario siendo editado

  // Form State
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', rol: 'MOZO' });

  const { data: usuarios, isLoading } = useQuery({ queryKey: ['usuarios'], queryFn: obtenerUsuarios });

  const guardarMutation = useMutation({
    mutationFn: (data: any) => editando ? actualizarUsuario(editando.id, data) : crearUsuario(data),
    onSuccess: () => {
      toast.success(editando ? 'Usuario actualizado' : 'Usuario creado');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setModalOpen(false);
      resetForm();
    },
    onError: () => toast.error('Error al guardar usuario')
  });

  const deleteMutation = useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: () => {
      toast.success('Usuario eliminado');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    }
  });

  const resetForm = () => {
    setFormData({ nombre: '', email: '', password: '', rol: 'MOZO' });
    setEditando(null);
  };

  const handleEdit = (user: any) => {
    setEditando(user);
    setFormData({ 
      nombre: user.nombre, 
      email: user.email, 
      password: '', // No mostramos la pass por seguridad
      rol: user.rol 
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    // Si edita y no pone password, la borramos del payload para no sobreescribir con vacío
    const payload = { ...formData };
    if (editando && !payload.password) delete (payload as any).password;
    
    guardarMutation.mutate(payload);
  };

  if (isLoading) return <div className="p-10">Cargando personal...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Gestión de Personal</h2>
        <Button onClick={() => { resetForm(); setModalOpen(true); }} className="gap-2">
          <Plus size={18} /> Nuevo Usuario
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios?.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nombre}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-bold 
                    ${u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                      u.rol === 'COCINA' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.rol}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(u)}><Pencil className="mr-2 h-4 w-4"/> Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteMutation.mutate(u.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL CREAR/EDITAR */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Usuario' : 'Nuevo Empleado'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Correo (Login)</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={formData.rol} onValueChange={v => setFormData({...formData, rol: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="MOZO">Mozo</SelectItem>
                  <SelectItem value="CAJERO">Cajero</SelectItem>
                  <SelectItem value="COCINA">Cocinero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contraseña {editando && '(Dejar vacío para no cambiar)'}</Label>
              <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <Button onClick={handleSubmit} className="w-full mt-4">Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};