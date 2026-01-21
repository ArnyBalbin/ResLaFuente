import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { User, Key, Eye, EyeOff, Save, Loader2, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import api from '@/api/axios';

// --- ESQUEMAS DE VALIDACIÓN (Igual que antes) ---
const profileSchema = z.object({
  nombre: z.string().min(3, 'El nombre es muy corto'),
  email: z.string().email('Email inválido'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export const ProfileView = () => {
  const { usuario, token, setAuth } = useAuthStore();
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: usuario?.nombre || '',
      email: usuario?.email || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data: ProfileForm) => {
    try {
      const { data: updatedUser } = await api.patch(`/usuarios/${usuario?.id}`, {
        nombre: data.nombre,
        email: data.email,
      });
      if (token && updatedUser) setAuth(token, updatedUser);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar perfil');
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    try {
      await api.patch(`/usuarios/${usuario?.id}`, { password: data.newPassword });
      toast.success('Contraseña actualizada correctamente');
      passwordForm.reset();
    } catch (error) {
      toast.error('Error al cambiar contraseña');
    }
  };

  return (
    // max-w-3xl centra el contenido y evita que se estire demasiado en pantallas gigantes
    <div className="max-w-3xl mx-auto space-y-6 pb-10 animate-fade-in">
      
      {/* Encabezado Simple */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">Administra tus datos personales.</p>
        </div>
        
        {/* Badge de Rol (Información útil, pero discreta) */}
        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full w-fit">
          <ShieldAlert size={14} className="text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            Rol: <span className="text-foreground font-bold">{usuario?.rol}</span>
          </span>
        </div>
      </div>

      {/* 1. TARJETA DE INFORMACIÓN PERSONAL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User size={18} className="text-primary" />
            Datos Básicos
          </CardTitle>
          <CardDescription>Esta información es visible en los reportes y tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input id="nombre" {...profileForm.register('nombre')} />
                {profileForm.formState.errors.nombre && 
                  <p className="text-xs text-destructive">{profileForm.formState.errors.nombre.message}</p>
                }
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" {...profileForm.register('email')} />
                {profileForm.formState.errors.email && 
                  <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
                }
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. TARJETA DE SEGURIDAD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key size={18} className="text-primary" />
            Cambiar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            
            <div className="space-y-2">
              <Label>Contraseña Actual</Label>
              <div className="relative">
                <Input 
                  type={showCurrent ? "text" : "password"} 
                  {...passwordForm.register('currentPassword')} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {passwordForm.formState.errors.currentPassword && 
                <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              }
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nueva Contraseña</Label>
                <div className="relative">
                  <Input 
                    type={showNew ? "text" : "password"} 
                    {...passwordForm.register('newPassword')} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {passwordForm.formState.errors.newPassword && 
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                }
              </div>

              <div className="space-y-2">
                <Label>Confirmar Nueva</Label>
                <Input 
                  type={showNew ? "text" : "password"} 
                  {...passwordForm.register('confirmPassword')} 
                />
                {passwordForm.formState.errors.confirmPassword && 
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                }
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="secondary" size="sm" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Actualizar Contraseña'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};