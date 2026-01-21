import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Save, Loader2 } from 'lucide-react'; // Iconos nuevos
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useUsuarios } from '../hooks/useUsuarios';
import type { Usuario } from '@/types';

// Validaciones (Igual que antes)
const usuarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre es muy corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')), 
  rol: z.enum(['ADMIN', 'MOZO', 'COCINA', 'CAJA']),
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

interface Props {
  userToEdit?: Usuario | null;
  onSuccess: () => void;
}

export function UsuarioForm({ userToEdit, onSuccess }: Props) {
  const { crearUsuario, actualizarUsuario } = useUsuarios();
  
  // Estado para alternar visibilidad de contraseña
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nombre: userToEdit?.nombre || '',
      email: userToEdit?.email || '',
      password: '',
      rol: (userToEdit?.rol as any) || 'MOZO',
    },
  });

  const onSubmit = async (data: UsuarioFormValues) => {
    try {
      if (userToEdit) {
        const { password, ...rest } = data;
        const payload = password ? data : rest; 
        await actualizarUsuario({ id: userToEdit.id, data: payload as any });
      } else {
        if (!data.password) {
           form.setError('password', { message: 'La contraseña es obligatoria al crear' });
           return;
        }
        await crearUsuario(data as any);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* COLUMNA 1: Nombre (Full width si es muy largo, o compartido) */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nombre">Nombre Completo</Label>
          <Input 
            id="nombre" 
            placeholder="Ej: Juan Pérez" 
            {...form.register('nombre')} 
          />
          {form.formState.errors.nombre && (
            <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
          )}
        </div>

        {/* COLUMNA 1, FILA 2: Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="juan@lafuente.com"
            {...form.register('email')} 
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* COLUMNA 2, FILA 2: Rol */}
        <div className="space-y-2">
          <Label>Rol Asignado</Label>
          <Select 
             defaultValue={form.getValues('rol')} 
             onValueChange={(val) => form.setValue('rol', val as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MOZO">Mozo</SelectItem>
              <SelectItem value="CAJA">Cajero</SelectItem>
              <SelectItem value="COCINA">Cocina</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* COLUMNA 1-2 (Full Width) o Compartido: Password */}
        {/* Lo pondremos full width en la fila 3 para darle importancia a la seguridad */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="password">
            Contraseña {userToEdit && <span className="text-muted-foreground font-normal text-xs">(Opcional al editar)</span>}
          </Label>
          
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder={userToEdit ? "••••••••" : "Ingresa una clave segura"}
              {...form.register('password')}
              className="pr-10" // Padding derecho para que el texto no choque con el icono
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>

          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {userToEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}