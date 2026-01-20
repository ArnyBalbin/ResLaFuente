import { useState } from 'react';
import { Plus, Pencil, Trash2, User as UserIcon } from 'lucide-react';
import { useUsuarios } from '../hooks/useUsuarios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UsuarioForm } from './UsuarioForm'; // Lo crearemos en el siguiente paso
import type { Usuario } from '@/types';

export const UsuariosView = () => {
  const { usuarios, isLoading, eliminarUsuario } = useUsuarios();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      await eliminarUsuario(id);
    }
  };

  if (isLoading) return <div className="p-4">Cargando usuarios...</div>;

  return (
    <div className="space-y-6">
      {/* Encabezado de la Sección */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Personal</h2>
          <p className="text-muted-foreground">Administra los accesos de Mozos, Caja y Cocina.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={(open) => {
           setIsModalOpen(open);
           if(!open) setEditingUser(null); // Limpiar al cerrar
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} /> Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
            </DialogHeader>
            {/* Formulario */}
            <UsuarioForm 
              userToEdit={editingUser} 
              onSuccess={() => setIsModalOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de Usuarios */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {usuarios.map((user) => (
              <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserIcon size={16} />
                  </div>
                  {user.nombre}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${user.rol === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                    ${user.rol === 'MOZO' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                    ${user.rol === 'COCINA' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                    ${user.rol === 'CAJA' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                  `}>
                    {user.rol}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                    <Pencil size={16} className="text-muted-foreground hover:text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                    <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
               <tr>
                 <td colSpan={4} className="p-8 text-center text-muted-foreground">
                   No hay usuarios registrados aparte de ti.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};