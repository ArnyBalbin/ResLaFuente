import { useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Layers, 
  ChevronRight, 
  CornerDownRight 
} from 'lucide-react';
import { useCategorias } from '../hooks/useCategorias';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoriaForm } from './CategoriaForm';
import type { Categoria } from '@/types';

export const CategoriasView = () => {
  const { categorias, isLoading, eliminarCategoria } = useCategorias();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Categoria | null>(null);
  const [padrePreseleccionado, setPadrePreseleccionado] = useState<number | null>(null);

  // --- HANDLERS ---
  const handleCreateRoot = () => {
    setEditingCat(null);
    setPadrePreseleccionado(null);
    setIsModalOpen(true);
  };

  const handleCreateSub = (padreId: number) => {
    setEditingCat(null);
    setPadrePreseleccionado(padreId); // Pre-llenamos el select
    setIsModalOpen(true);
  };

  const handleEdit = (cat: Categoria) => {
    setEditingCat(cat);
    setPadrePreseleccionado(null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCat(null);
    setPadrePreseleccionado(null);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (confirm(`¿Eliminar la categoría "${nombre}"? Si tiene productos, no se podrá borrar.`)) {
      await eliminarCategoria(id);
    }
  };

  if (isLoading) return <div>Cargando carta...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categorías de la Carta</h2>
        </div>
        <Button onClick={handleCreateRoot} className="gap-2">
          <Plus size={18} /> Nueva Categoría
        </Button>
      </div>

      {/* GRID DE CATEGORÍAS PADRE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map((padre) => (
          <div key={padre.id} className="border rounded-xl bg-card shadow-sm flex flex-col overflow-hidden group">
            
            {/* CABECERA (PADRE) */}
            <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <Layers size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{padre.nombre}</h3>
                  <span className="text-[10px] text-muted-foreground">
                    {padre.hijos?.length || 0} subcategorías
                  </span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(padre)}>
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(padre.id, padre.nombre)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            {/* LISTA DE HIJOS */}
            <div className="p-2 flex-1 flex flex-col gap-1">
              {padre.hijos && padre.hijos.length > 0 ? (
                padre.hijos.map((hijo) => (
                  <div key={hijo.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 text-sm group/child">
                    <div className="flex items-center gap-2">
                      <CornerDownRight size={14} className="text-muted-foreground/50" />
                      <span>{hijo.nombre}</span>
                      {hijo._count?.productos ? (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                          {hijo._count.productos} prods
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover/child:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(hijo)}>
                        <Pencil size={12} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(hijo.id, hijo.nombre)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground border-dashed border rounded m-2">
                  Sin subcategorías
                </div>
              )}
              
              {/* Botón para agregar hijo rápido */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs text-muted-foreground hover:text-primary mt-auto"
                onClick={() => handleCreateSub(padre.id)}
              >
                <Plus size={14} className="mr-2" /> Agregar Subcategoría
              </Button>
            </div>
          </div>
        ))}

        {/* TARJETA VACÍA (Add New) - Opcional, para llenar espacio */}
        {categorias.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No hay categorías. Crea la primera para empezar tu carta.
          </div>
        )}
      </div>

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCat ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>
          <CategoriaForm 
            categoriaToEdit={editingCat} 
            padrePreseleccionado={padrePreseleccionado}
            onSuccess={handleClose} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};