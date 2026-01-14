import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerProductos } from '@/features/productos/productos.api';
import { obtenerKardex, crearMovimiento } from '@/features/inventario/inventario.api';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PackagePlus, History, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export const InventarioPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  
  // Formulario
  const [prodId, setProdId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');

  // Cargar datos
  const { data: kardex } = useQuery({ queryKey: ['kardex'], queryFn: obtenerKardex });
  const { data: productos } = useQuery({ queryKey: ['productos'], queryFn: obtenerProductos });

  // Mutación para guardar
  const mutation = useMutation({
    mutationFn: crearMovimiento,
    onSuccess: () => {
      toast.success('Stock actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['kardex'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      setModalOpen(false);
      setCantidad(''); setMotivo('');
    },
    onError: () => toast.error('Error al registrar movimiento')
  });

  const handleGuardar = () => {
    mutation.mutate({
      productoId: Number(prodId),
      tipo: 'ENTRADA', // Por defecto es entrada de mercadería
      cantidad: Number(cantidad),
      motivo: motivo || 'Reposición de stock'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <History /> Kardex / Inventario
        </h2>
        
        {/* MODAL DE NUEVA ENTRADA */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <PackagePlus size={20} /> Registrar Entrada (Compra)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reponer Stock</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Producto</Label>
                <Select onValueChange={setProdId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productos?.filter(p => p.esProductoFinal).map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nombre} (Actual: {p.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cantidad a ingresar</Label>
                  <Input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Motivo / Proveedor</Label>
                  <Input placeholder="Ej: Compra Makro" value={motivo} onChange={e => setMotivo(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleGuardar} disabled={mutation.isPending} className="w-full mt-4">
                {mutation.isPending ? 'Guardando...' : 'Confirmar Ingreso'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLA DE HISTORIAL */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kardex?.map((mov: any) => (
              <TableRow key={mov.id}>
                <TableCell>{new Date(mov.fecha).toLocaleString()}</TableCell>
                <TableCell className="font-medium">{mov.producto?.nombre}</TableCell>
                <TableCell>
                  {mov.tipo === 'ENTRADA' ? (
                    <span className="flex items-center gap-1 text-green-600"><ArrowUpCircle size={16}/> Entrada</span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500"><ArrowDownCircle size={16}/> Salida</span>
                  )}
                </TableCell>
                <TableCell className="font-bold">{mov.cantidad}</TableCell>
                <TableCell className="text-slate-500">{mov.motivo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};