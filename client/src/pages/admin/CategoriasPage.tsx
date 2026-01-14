import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '@/features/categorias/categorias.api';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, MoreHorizontal, Layers } from 'lucide-react';

export const CategoriasPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<any>(null);

  const [formData, setFormData] = useState({ nombre: '' });

  // 1. CARGAR DATOS
  const { data: categorias, isLoading } = useQuery({ 
    queryKey: ['categorias'], 
    queryFn: obtenerCategorias 
  });

  // 2. MUTACIÓN: CREAR / EDITAR
  const guardarMutation = useMutation({
    mutationFn: (datos: any) => {
      if (categoriaEditando) return actualizarCategoria(categoriaEditando.id, datos);
      return crearCategoria(datos);
    },
    onSuccess: () => {
      toast.success(categoriaEditando ? 'Categoría actualizada' : 'Categoría creada');
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      cerrarModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al guardar')
  });

  // 3. MUTACIÓN: ELIMINAR
  const eliminarMutation = useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => {
      toast.success('Categoría eliminada');
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'No se pudo eliminar')
  });

  // FUNCIONES AUXILIARES
  const cerrarModal = () => {
    setModalOpen(false);
    setCategoriaEditando(null);
    setFormData({ nombre: '' });
  };

  const abrirParaCrear = () => {
    setCategoriaEditando(null); // Limpiar estado anterior por si acaso
    setFormData({ nombre: '' });
    setModalOpen(true);
  };

  const abrirParaEditar = (cat: any) => {
    setCategoriaEditando(cat);
    setFormData({ nombre: cat.nombre });
    setModalOpen(true);
  };

  if (isLoading) return <div className="p-10 text-center">Cargando categorías...</div>;

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Categorías del Menú</h2>
          <p className="text-slate-500">Organiza tus platos (Ej: Entradas, Bebidas).</p>
        </div>
        <Button onClick={abrirParaCrear} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus size={18} /> Nueva Categoría
        </Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nombre de Categoría</TableHead>
              <TableHead>Cant. Productos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias?.map((cat: any) => (
              <TableRow key={cat.id}>
                <TableCell>
                  <div className="bg-orange-100 p-2 rounded-full w-fit">
                    <Layers size={16} className="text-orange-600"/>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-lg">{cat.nombre}</TableCell>
                <TableCell>
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                    {cat._count?.productos || 0} platos
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => abrirParaEditar(cat)}>
                        <Pencil className="mr-2 h-4 w-4"/> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                           if(confirm('¿Eliminar esta categoría?')) eliminarMutation.mutate(cat.id)
                        }} 
                        className="text-red-600 focus:text-red-600"
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input 
                placeholder="Ej: Postres" 
                value={formData.nombre} 
                onChange={(e) => setFormData({ nombre: e.target.value })} 
                onKeyDown={(e) => e.key === 'Enter' && guardarMutation.mutate(formData)}
              />
            </div>
            <Button onClick={() => guardarMutation.mutate(formData)} disabled={guardarMutation.isPending} className="w-full bg-blue-600">
              {guardarMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};
