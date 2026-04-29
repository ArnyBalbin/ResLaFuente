import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  MoreVertical,
  Utensils,
  ImageOff
} from 'lucide-react';
import { useProductos } from '../hooks/useProductos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProductoForm } from './ProductoForm';
import type { Producto } from '@/types';

export const ProductosView = () => {
  const { productos, isLoading, toggleProducto, eliminarProducto } = useProductos();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  // --- FILTRADO EN FRONTEND ---
  const filteredProducts = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (prod: Producto) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar producto?')) {
      await eliminarProducto(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Cargando la carta...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Carta de Productos</h2>
          <p className="text-muted-foreground">Gestiona precios, fotos y disponibilidad del día.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shadow-sm">
          <Plus size={18} /> Nuevo Plato
        </Button>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm max-w-md">
        <Search className="text-muted-foreground ml-2" size={18} />
        <Input 
          placeholder="Buscar por nombre o categoría..." 
          className="border-none shadow-none focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA RICA */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 text-muted-foreground font-medium border-b">
            <tr>
              <th className="px-4 py-3 w-[80px]">Imagen</th>
              <th className="px-4 py-3">Nombre / Descripción</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Disponible</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts.map((prod) => (
              <tr key={prod.id} className={`group transition-colors ${!prod.disponibleHoy ? 'bg-muted/30' : 'hover:bg-muted/10'}`}>
                
                {/* IMAGEN */}
                <td className="px-4 py-3">
                  <div className="h-12 w-12 rounded-lg bg-muted border overflow-hidden relative">
                    {prod.imagenUrl ? (
                      <img src={prod.imagenUrl} alt={prod.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <ImageOff size={16} />
                      </div>
                    )}
                  </div>
                </td>

                {/* INFO PRINCIPAL */}
                <td className="px-4 py-3 max-w-[250px]">
                  <div className="font-medium text-foreground">{prod.nombre}</div>
                  {prod.descripcion && (
                    <div className="text-xs text-muted-foreground truncate" title={prod.descripcion}>
                      {prod.descripcion}
                    </div>
                  )}
                </td>

                {/* CATEGORÍA */}
                <td className="px-4 py-3">
                  <Badge variant="outline" className="font-normal text-muted-foreground">
                    {prod.categoria?.nombre || 'Sin Cat.'}
                  </Badge>
                </td>

                {/* PRECIO */}
                <td className="px-4 py-3 font-semibold text-foreground">
                  S/ {Number(prod.precio).toFixed(2)}
                </td>

                {/* STOCK */}
                <td className="px-4 py-3 text-center">
                  {prod.controlarStock ? (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold 
                      ${prod.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {prod.stock} un.
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">∞</span>
                  )}
                </td>

                {/* SWITCH DISPONIBILIDAD */}
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <Switch 
                      checked={prod.disponibleHoy}
                      onCheckedChange={() => toggleProducto(prod.id)}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                </td>

                {/* ACCIONES */}
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical size={16} className="text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(prod)}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(prod.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>

              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Utensils className="h-8 w-8 opacity-20" />
                    <p>No se encontraron productos.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if(!open) setEditingProduct(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Producto' : 'Crear Nuevo Plato'}
            </DialogTitle>
          </DialogHeader>
          <ProductoForm 
            productToEdit={editingProduct} 
            onSuccess={() => {
              setIsModalOpen(false);
              setEditingProduct(null);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};