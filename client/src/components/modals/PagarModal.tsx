import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { realizarPago } from '@/features/pagos/pagos.api';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Banknote, Smartphone } from 'lucide-react';

interface PagarModalProps {
  pedido: any;
  isOpen: boolean;
  onClose: () => void;
}

export const PagarModal = ({ pedido, isOpen, onClose }: PagarModalProps) => {
  const queryClient = useQueryClient();
  const [metodo, setMetodo] = useState<'EFECTIVO' | 'YAPE_PLIN' | 'TARJETA'>('EFECTIVO');
  const [codigoOp, setCodigoOp] = useState('');

  const mutation = useMutation({
    mutationFn: realizarPago,
    onSuccess: () => {
      toast.success(`Mesa ${pedido.mesa.numero} liberada correctamente`);
      queryClient.invalidateQueries({ queryKey: ['mesas'] }); // Recargar mapa de mesas
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al procesar pago');
    }
  });

  const handlePagar = () => {
    mutation.mutate({
      pedidoId: pedido.id,
      cajaId: 1, // TODO: Dinámico cuando implementemos Apertura de Caja
      monto: Number(pedido.total),
      metodo: metodo,
      codigoOperacion: metodo === 'YAPE_PLIN' ? codigoOp : undefined
    });
  };

  if (!pedido) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cobrar Mesa {pedido.mesa?.numero}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          
          {/* Resumen del Monto */}
          <div className="bg-slate-100 p-4 rounded-lg text-center">
            <p className="text-sm text-slate-500">Total a Pagar</p>
            <p className="text-3xl font-bold text-slate-900">S/ {Number(pedido.total).toFixed(2)}</p>
          </div>

          {/* Selección de Método */}
          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <RadioGroup defaultValue="EFECTIVO" onValueChange={(v: any) => setMetodo(v)} className="grid grid-cols-3 gap-2">
              
              <div className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-slate-50 ${metodo === 'EFECTIVO' ? 'border-blue-600 bg-blue-50' : ''}`}>
                <RadioGroupItem value="EFECTIVO" id="efectivo" className="sr-only" />
                <Label htmlFor="efectivo" className="cursor-pointer flex flex-col items-center gap-2">
                  <Banknote /> <span className="text-xs">Efectivo</span>
                </Label>
              </div>

              <div className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-slate-50 ${metodo === 'YAPE_PLIN' ? 'border-blue-600 bg-blue-50' : ''}`}>
                <RadioGroupItem value="YAPE_PLIN" id="yape" className="sr-only" />
                <Label htmlFor="yape" className="cursor-pointer flex flex-col items-center gap-2">
                  <Smartphone /> <span className="text-xs">Yape/Plin</span>
                </Label>
              </div>

              <div className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-slate-50 ${metodo === 'TARJETA' ? 'border-blue-600 bg-blue-50' : ''}`}>
                <RadioGroupItem value="TARJETA" id="tarjeta" className="sr-only" />
                <Label htmlFor="tarjeta" className="cursor-pointer flex flex-col items-center gap-2">
                  <CreditCard /> <span className="text-xs">Tarjeta</span>
                </Label>
              </div>

            </RadioGroup>
          </div>

          {/* Input condicional para Yape */}
          {metodo === 'YAPE_PLIN' && (
            <div className="space-y-2 animate-in fade-in zoom-in-95">
              <Label>Código de Operación (Pantallazo)</Label>
              <Input 
                placeholder="Ej: 123456" 
                value={codigoOp} 
                onChange={(e) => setCodigoOp(e.target.value)} 
              />
            </div>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handlePagar} disabled={mutation.isPending} className="bg-green-600 hover:bg-green-700">
            {mutation.isPending ? 'Procesando...' : 'Cobrar y Liberar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};