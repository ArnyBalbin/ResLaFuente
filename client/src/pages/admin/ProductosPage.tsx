import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerProductos, crearProducto } from '@/features/productos/productos.api';
import { obtenerCategorias } from '@/features/productos/productos.api'; // Asegúrate de tener esto
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; // npx shadcn@latest add switch
import { Plus } from 'lucide-react';

export const ProductosPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    nombre: '', precio: '', categoriaId: '', imagenUrl: '', esProductoFinal: true 
  });

  const { data: productos } = useQuery({ queryKey: ['productos'], queryFn: obtenerProductos });
  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: obtenerCategorias });

  const mutation = useMutation({
    mutationFn: (data: any) => crearProducto({...data, precio: Number(data.precio), categoriaId: Number(data.categoriaId)}),
    onSuccess: () => {
      toast.success('Producto creado');
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      setModalOpen(false);
      setFormData({ nombre: '', precio: '', categoriaId: '', imagenUrl: '', esProductoFinal: true });
    },
    onError: () => toast.error('Error al crear producto')
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Carta de Productos</h2>
        <Button onClick={() => setModalOpen(true)} className="gap-2"><Plus size={18}/> Nuevo Plato</Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Control Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos?.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>
                  <img src={p.imagenUrl || 'https://placehold.co/50'} className="w-10 h-10 rounded object-cover bg-slate-100" />
                </TableCell>
                <TableCell className="font-medium">{p.nombre}</TableCell>
                <TableCell>{p.categoria?.nombre}</TableCell>
                <TableCell>S/ {Number(p.precio).toFixed(2)}</TableCell>
                <TableCell>{p.esProductoFinal ? 'Sí (Inventario)' : 'No (Cocina)'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nuevo Producto</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del Plato</Label>
                <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Precio (S/)</Label>
                <Input type="number" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select onValueChange={v => setFormData({...formData, categoriaId: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                <SelectContent>
                  {categorias?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>URL de Imagen (O usa el uploader)</Label>
              <Input placeholder="http://..." value={formData.imagenUrl} onChange={e => setFormData({...formData, imagenUrl: e.target.value})} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="stock" 
                checked={formData.esProductoFinal} 
                onCheckedChange={c => setFormData({...formData, esProductoFinal: c})} 
              />
              <Label htmlFor="stock">¿Controlar Stock en Inventario?</Label>
            </div>
            
            <Button onClick={() => mutation.mutate(formData)} className="w-full mt-4">Guardar Producto</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};