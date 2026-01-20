import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import logo from '../../assets/lafuente.png';

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      // 1. Llamada al Backend
      const response = await api.post('/auth/login', data);
      
      // 2. Guardar Token y Usuario en Zustand
      const { access_token, usuario } = response.data;
      setAuth(access_token, usuario);

      toast.success(`Bienvenido, ${usuario.nombre}`);
      
      // 3. Redirigir al Dashboard
      navigate('/');
      
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 relative">

      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg border border-border">
        
        {/* Cabecera con Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-sm p-2 mb-2">
             <img src={logo} alt="La Fuente" className="object-contain h-full w-full" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Sistema La Fuente</h1>
          <p className="text-sm text-muted-foreground">Ingresa tus credenciales para acceder</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="admin@lafuente.com" 
              {...register('email')}
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              {...register('password')}
              className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
          </div>

          <Button 
            type="submit" 
            className="w-full font-bold shadow-md hover:shadow-lg transition-all" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

        </form>

        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          &copy; 2026 Restaurante La Fuente - Versión Tesis 1.0
        </div>
      </div>
    </div>
  );
}