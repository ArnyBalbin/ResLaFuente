import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerProductos, obtenerCategorias, crearProducto, actualizarProducto, eliminarProducto } from '@/features/productos/productos.api';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, MoreHorizontal, Image as ImageIcon } from 'lucide-react';

export const ProductosPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any>(null);

  // Estado del Formulario
  const [formData, setFormData] = useState({ 
    nombre: '', 
    precio: '', 
    categoriaId: '', 
    imagenUrl: '', 
    esProductoFinal: false // Por defecto es plato preparado (false)
  });

  // CARGAR DATOS
  const { data: productos, isLoading } = useQuery({ queryKey: ['productos'], queryFn: obtenerProductos });
  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: obtenerCategorias });

  // MUTACIONES
  const guardarMutation = useMutation({
    mutationFn: (data: any) => {
      // Convertir tipos antes de enviar
      const payload = {
        ...data,
        precio: Number(data.precio),
        categoriaId: Number(data.categoriaId)
      };
      
      if (productoEditando) return actualizarProducto(productoEditando.id, payload);
      return crearProducto(payload);
    },
    onSuccess: () => {
      toast.success(productoEditando ? 'Producto actualizado' : 'Producto creado');
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      cerrarModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al guardar')
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => {
      toast.success('Producto eliminado');
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'No se puede eliminar')
  });

  // HELPERS
  const cerrarModal = () => {
    setModalOpen(false);
    setProductoEditando(null);
    setFormData({ nombre: '', precio: '', categoriaId: '', imagenUrl: '', esProductoFinal: false });
  };

  const abrirParaEditar = (prod: any) => {
    setProductoEditando(prod);
    setFormData({ 
      nombre: prod.nombre, 
      precio: prod.precio, 
      categoriaId: prod.categoriaId.toString(), 
      imagenUrl: prod.imagenUrl || '', 
      esProductoFinal: prod.esProductoFinal 
    });
    setModalOpen(true);
  };

  if (isLoading) return <div className="p-10 text-center">Cargando carta...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Carta de Productos</h2>
          <p className="text-slate-500">Administra los platos y bebidas que vendes.</p>
        </div>
        <Button onClick={() => { cerrarModal(); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus size={18}/> Nuevo Plato
        </Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos?.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.imagenUrl ? (
                    <img src={p.imagenUrl} alt={p.nombre} className="w-10 h-10 rounded-md object-cover border" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                      <ImageIcon size={16} />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{p.nombre}</TableCell>
                <TableCell>{p.categoria?.nombre || 'Sin categoría'}</TableCell>
                <TableCell>S/ {Number(p.precio).toFixed(2)}</TableCell>
                <TableCell>
                  {p.esProductoFinal ? (
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200">Inventariable</span>
                  ) : (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded border border-orange-200">Cocina</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => abrirParaEditar(p)}>
                        <Pencil className="mr-2 h-4 w-4"/> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => { if(confirm('¿Borrar este producto?')) eliminarMutation.mutate(p.id) }} 
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4"/> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del Plato/Bebida</Label>
                <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: Lomo Saltado" />
              </div>
              <div className="space-y-2">
                <Label>Precio (S/)</Label>
                <Input type="number" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} placeholder="0.00" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={formData.categoriaId} onValueChange={v => setFormData({...formData, categoriaId: v})}>
                <SelectTrigger><SelectValue placeholder="Selecciona una categoría..." /></SelectTrigger>
                <SelectContent>
                  {categorias?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>URL de Imagen</Label>
              <Input placeholder="https://..." value={formData.imagenUrl} onChange={e => setFormData({...formData, imagenUrl: e.target.value})} />
              <p className="text-xs text-slate-500">Pega un link de imagen de internet por ahora.</p>
            </div>

            <div className="flex items-center space-x-2 border p-4 rounded-md bg-slate-50">
              <Switch 
                id="stock" 
                checked={formData.esProductoFinal} 
                onCheckedChange={c => setFormData({...formData, esProductoFinal: c})} 
              />
              <div className="flex flex-col">
                <Label htmlFor="stock">¿Es Producto de Almacén?</Label>
                <span className="text-xs text-slate-500">Activa esto para Gaseosas o Cervezas (Controla Stock). Déjalo apagado para Platos de Cocina.</span>
              </div>
            </div>
            
            <Button onClick={() => guardarMutation.mutate(formData)} disabled={guardarMutation.isPending} className="w-full mt-4 bg-blue-600">
              {guardarMutation.isPending ? 'Guardando...' : 'Guardar Producto'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};