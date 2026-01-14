import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerCajaActual, abrirCaja, cerrarCaja } from '@/features/caja/caja.api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DollarSign, Lock, Unlock, Calculator } from 'lucide-react';

export const CajaPage = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  
  const [montoInput, setMontoInput] = useState('');

  // 1. Consultar estado actual
  const { data: cajaActual, isLoading } = useQuery({
    queryKey: ['caja-actual', user?.id], // La key incluye el ID para que sea única
    queryFn: () => obtenerCajaActual(user!.id),
    enabled: !!user?.id, // Solo ejecuta si hay usuario
  });

  // 2. Mutación Abrir
  const abrirMutation = useMutation({
    mutationFn: (monto: number) => abrirCaja(user!.id, monto),
    onSuccess: () => {
      toast.success('¡Caja Abierta! Ya puedes realizar ventas.');
      queryClient.invalidateQueries({ queryKey: ['caja-actual'] });
      setMontoInput('');
    },
    onError: () => toast.error('Error al abrir caja')
  });

  // 3. Mutación Cerrar
  const cerrarMutation = useMutation({
    mutationFn: (monto: number) => cerrarCaja(cajaActual.id, monto),
    onSuccess: () => {
      toast.success('Caja Cerrada. Turno finalizado.');
      queryClient.invalidateQueries({ queryKey: ['caja-actual'] });
      setMontoInput('');
    },
    onError: () => toast.error('Error al cerrar caja')
  });

  if (isLoading) return <div className="p-10">Verificando caja...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Gestión de Caja</h2>

      {/* --- ESTADO 1: CAJA CERRADA (HAY QUE ABRIR) --- */}
      {!cajaActual ? (
        <Card className="border-l-4 border-l-red-500 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Lock /> La Caja está Cerrada
            </CardTitle>
            <CardDescription>
              No se pueden realizar cobros hasta que inicies el turno.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="monto-inicial">Monto Inicial (Sencillo en caja)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                  id="monto-inicial" 
                  type="number" 
                  placeholder="0.00" 
                  className="pl-9"
                  value={montoInput}
                  onChange={(e) => setMontoInput(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={() => abrirMutation.mutate(Number(montoInput))}
              disabled={abrirMutation.isPending || !montoInput}
              className="bg-red-600 hover:bg-red-700"
            >
              {abrirMutation.isPending ? 'Abriendo...' : 'Abrir Turno'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* --- ESTADO 2: CAJA ABIERTA (SE PUEDE VENDER O CERRAR) --- */
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Tarjeta de Información */}
          <Card className="border-l-4 border-l-green-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Unlock /> Caja Abierta
              </CardTitle>
              <CardDescription>
                Turno activo de: <b>{cajaActual.usuario?.nombre || 'Desconocido'}</b>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                <span className="text-slate-500">Monto Inicial:</span>
                <span className="font-bold text-lg">S/ {Number(cajaActual.montoInicial).toFixed(2)}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                <span className="text-slate-500">Fecha Apertura:</span>
                <span className="font-medium text-sm">
                  {new Date(cajaActual.fechaApertura).toLocaleString()}
                </span>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <Calculator className="h-4 w-4" />
                <AlertTitle>Sistema Operativo</AlertTitle>
                <AlertDescription>
                  Se pueden recibir pagos de las mesas.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Tarjeta de Cierre */}
          <Card>
            <CardHeader>
              <CardTitle>Arqueo / Cierre de Caja</CardTitle>
              <CardDescription>
                Ingresa el dinero real que tienes en el cajón para cerrar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="monto-final">Dinero Total en Cajón</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input 
                    id="monto-final" 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-9"
                    value={montoInput}
                    onChange={(e) => setMontoInput(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => cerrarMutation.mutate(Number(montoInput))}
                disabled={!montoInput}
              >
                Cerrar Caja y Terminar Turno
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};