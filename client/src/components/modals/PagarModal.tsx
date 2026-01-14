import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { realizarPago } from '@/features/pagos/pagos.api';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Banknote, Smartphone, CheckCircle, FileText, Printer } from 'lucide-react';

interface PagarModalProps {
  pedido: any;
  isOpen: boolean;
  onClose: () => void;
}

export const PagarModal = ({ pedido, isOpen, onClose }: PagarModalProps) => {
  const queryClient = useQueryClient();
  const [metodo, setMetodo] = useState<'EFECTIVO' | 'YAPE_PLIN' | 'TARJETA'>('EFECTIVO');
  const [codigoOp, setCodigoOp] = useState('');
  
  // Nuevo estado para mostrar el PDF tras pagar
  const [resultadoPago, setResultadoPago] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: realizarPago,
    onSuccess: (data) => {
      // data = Respuesta del backend (incluye el objeto Pago y la url del PDF si se configuró)
      toast.success(`Mesa liberada correctamente`);
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      
      // En vez de cerrar, guardamos el resultado para mostrar el botón de PDF
      setResultadoPago(data);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al procesar pago');
    }
  });

  const handlePagar = () => {
    mutation.mutate({
      pedidoId: pedido.id,
      cajaId: 1, 
      monto: Number(pedido.total),
      metodo: metodo,
      codigoOperacion: metodo === 'YAPE_PLIN' ? codigoOp : undefined
    });
  };

  const handleCerrarTodo = () => {
    setResultadoPago(null); // Reseteamos
    setMetodo('EFECTIVO');
    setCodigoOp('');
    onClose();
  };

  if (!pedido) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCerrarTodo()}>
      <DialogContent className="sm:max-w-md">
        
        {/* --- VISTA 2: PAGO EXITOSO (PDF) --- */}
        {resultadoPago ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center animate-in zoom-in-95">
            <div className="bg-green-100 p-4 rounded-full text-green-600">
              <CheckCircle size={48} />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-800">¡Pago Registrado!</h2>
              <p className="text-slate-500">La mesa ha sido liberada.</p>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-col gap-3 w-full mt-4">
              {resultadoPago.comprobanteUrl ? (
                <Button 
                  className="w-full bg-slate-800 hover:bg-slate-900 gap-2"
                  onClick={() => window.open(resultadoPago.comprobanteUrl, '_blank')}
                >
                  <FileText size={18} /> Ver Boleta Electrónica
                </Button>
              ) : (
                <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md border border-yellow-200">
                  Nota: No se generó boleta electrónica (Modo Prueba)
                </div>
              )}
              
              <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                <Printer size={18} /> Imprimir Ticket Interno
              </Button>
            </div>

            <Button variant="ghost" onClick={handleCerrarTodo} className="mt-2 text-slate-400">
              Cerrar Ventana
            </Button>
          </div>
        ) : (
          /* --- VISTA 1: FORMULARIO DE PAGO (Lo que ya tenías) --- */
          <>
            <DialogHeader>
              <DialogTitle>Cobrar Mesa {pedido.mesa?.numero}</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="bg-slate-100 p-4 rounded-lg text-center">
                <p className="text-sm text-slate-500">Total a Pagar</p>
                <p className="text-3xl font-bold text-slate-900">S/ {Number(pedido.total).toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <RadioGroup defaultValue="EFECTIVO" onValueChange={(v: any) => setMetodo(v)} className="grid grid-cols-3 gap-2">
                  <div className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-slate-50 ${metodo === 'EFECTIVO' ? 'border-blue-600 bg-blue-50' : ''}`}>
                    <RadioGroupItem value="EFECTIVO" id="efectivo" className="sr-only" />
                    <Label htmlFor="efectivo" className="cursor-pointer flex flex-col items-center gap-2"><Banknote /> <span className="text-xs">Efectivo</span></Label>
                  </div>
                  <div className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-slate-50 ${metodo === 'YAPE_PLIN' ? 'border-blue-600 bg-blue-50' : ''}`}>
                    <RadioGroupItem value="YAPE_PLIN" id="yape" className="sr-only" />
                    <Label htmlFor="yape" className="cursor-pointer flex flex-col items-center gap-2"><Smartphone /> <span className="text-xs">Yape</span></Label>
                  </div>
                  <div className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-slate-50 ${metodo === 'TARJETA' ? 'border-blue-600 bg-blue-50' : ''}`}>
                    <RadioGroupItem value="TARJETA" id="tarjeta" className="sr-only" />
                    <Label htmlFor="tarjeta" className="cursor-pointer flex flex-col items-center gap-2"><CreditCard /> <span className="text-xs">Tarjeta</span></Label>
                  </div>
                </RadioGroup>
              </div>

              {metodo === 'YAPE_PLIN' && (
                <div className="space-y-2 animate-in fade-in zoom-in-95">
                  <Label>Código de Operación</Label>
                  <Input placeholder="Ej: 123456" value={codigoOp} onChange={(e) => setCodigoOp(e.target.value)} />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCerrarTodo}>Cancelar</Button>
              <Button onClick={handlePagar} disabled={mutation.isPending} className="bg-green-600 hover:bg-green-700">
                {mutation.isPending ? 'Procesando...' : 'Cobrar y Liberar'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};