import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsuarios } from '../hooks/useUsuarios';
import type { Usuario } from '@/types';

// Validaciones
const usuarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre es muy corto'),
  email: z.string().email('Email inválido'),
  // Password es opcional si estamos editando
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
        // Al editar, si el password está vacío, no lo enviamos
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Nombre Completo</Label>
        <Input {...form.register('nombre')} />
        {form.formState.errors.nombre && <p className="text-destructive text-xs">{form.formState.errors.nombre.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input {...form.register('email')} type="email" />
        {form.formState.errors.email && <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Contraseña {userToEdit && '(Dejar en blanco para mantener actual)'}</Label>
        <Input {...form.register('password')} type="password" />
        {form.formState.errors.password && <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Rol</Label>
        <Select 
           defaultValue={form.getValues('rol')} 
           onValueChange={(val) => form.setValue('rol', val as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Administrador</SelectItem>
            <SelectItem value="MOZO">Mozo</SelectItem>
            <SelectItem value="CAJA">Cajero</SelectItem>
            <SelectItem value="COCINA">Cocina</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
        </Button>
      </div>
    </form>
  );
}