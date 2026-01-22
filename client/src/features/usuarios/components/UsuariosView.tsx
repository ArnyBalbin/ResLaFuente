import { useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  User as UserIcon, 
  RotateCcw,
  ArchiveX,
  Phone
} from 'lucide-react';
import { useUsuarios } from '../hooks/useUsuarios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UsuarioForm } from './UsuarioForm';
import type { Usuario } from '@/types';
import { toast } from 'sonner';

export const UsuariosView = () => {
  const { usuarios, isLoading, eliminarUsuario, actualizarUsuario } = useUsuarios();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  const [showInactive, setShowInactive] = useState(false);

  const personalStaff = usuarios
    .filter(u => u.rol !== 'ADMIN')
    .filter(u => showInactive ? !u.activo : u.activo);

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de desactivar este usuario?')) {
      await eliminarUsuario(id); 
    }
  };

  const handleRestore = async (id: number) => {
    if (confirm('¿Deseas reactivar este usuario para que pueda acceder al sistema?')) {
      try {
        await actualizarUsuario({ id, data: { activo: true } });
        toast.success('Usuario restaurado correctamente');
      } catch (error) {
        toast.error('Error al restaurar usuario');
      }
    }
  };

  if (isLoading) return <div className="p-4">Cargando personal...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado con Controles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* SWITCH "VER ELIMINADOS" */}
          <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg border">
            <Switch 
              id="show-inactive" 
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive" className="cursor-pointer text-sm font-medium">
              {showInactive ? 'Ver Activos' : 'Eliminados'}
            </Label>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            {!showInactive && (
              <Button className="gap-2 shadow-sm" onClick={handleCreate}>
                <Plus size={18} /> Nuevo Usuario
              </Button>
            )}
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
              </DialogHeader>
              
              <UsuarioForm 
                userToEdit={editingUser} 
                onSuccess={handleCloseModal}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {personalStaff.map((user) => (
              <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center 
                    ${user.activo ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <UserIcon size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span>{user.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {user.telefono || '-'}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className={`
                    ${user.rol === 'MOZO' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}
                    ${user.rol === 'COCINA' ? 'border-orange-200 bg-orange-50 text-orange-700' : ''}
                    ${user.rol === 'CAJA' ? 'border-green-200 bg-green-50 text-green-700' : ''}
                  `}>
                    {user.rol}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {user.activo ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Activo</Badge>
                  ) : (
                    <Badge variant="destructive" className="opacity-80">Inactivo</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  
                  {/* Si está ACTIVO: Botones Editar y Eliminar */}
                  {user.activo ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                        <Pencil size={16} className="text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                        <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                      </Button>
                    </>
                  ) : (
                    /* Si está INACTIVO: Botón Restaurar */
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRestore(user.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-2"
                    >
                      <RotateCcw size={16} />
                      <span className="sr-only sm:not-sr-only sm:inline">Restaurar</span>
                    </Button>
                  )}
                  
                </td>
              </tr>
            ))}
            
            {/* Estado Vacío Inteligente */}
            {personalStaff.length === 0 && (
               <tr>
                 <td colSpan={5} className="p-12 text-center text-muted-foreground">
                   <div className="flex flex-col items-center justify-center gap-2">
                     <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                        {showInactive ? <ArchiveX className="h-6 w-6 opacity-50" /> : <UserIcon className="h-6 w-6 opacity-50" />}
                     </div>
                     <p className="font-medium">
                       {showInactive 
                         ? 'La papelera está vacía.' 
                         : 'No hay personal activo registrado.'}
                     </p>
                     {showInactive && (
                       <p className="text-xs">Los usuarios desactivados aparecerán aquí.</p>
                     )}
                   </div>
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};