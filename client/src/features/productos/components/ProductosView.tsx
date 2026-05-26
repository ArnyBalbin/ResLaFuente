import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, MoreVertical, Utensils, ImageOff, ChevronLeft } from 'lucide-react';
import { useProductos } from '../hooks/useProductos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProductoForm } from './ProductoForm';
import type { Producto, TipoArticulo } from '@/types';

export const ProductosView = () => {
  const { productos, isLoading, toggleProducto, eliminarProducto } = useProductos();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado de navegación UI
  const [activeTab, setActiveTab] = useState<TipoArticulo>('PLATO');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  // Filtrado doble: Por Tipo (Tab activo) y por Búsqueda (Input)
  const filteredProducts = productos.filter(p => 
    p.tipo === activeTab &&
    (p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (prod: Producto) => {
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      await eliminarProducto(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando el catálogo...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">
            {isFormOpen ? (editingProduct ? 'Editar Registro' : `Nuevo ${activeTab === 'PLATO' ? 'Plato' : 'Producto'}`) : 'Gestión de Catálogo'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isFormOpen ? 'Completa los datos del formulario a continuación.' : 'Administra tu carta de platos y el inventario de productos extras.'}
          </p>
        </div>
        
        {isFormOpen ? (
          <Button variant="outline" onClick={() => setIsFormOpen(false)} className="gap-2">
            <ChevronLeft size={16} /> Volver a la lista
          </Button>
        ) : (
          <Button onClick={handleCreate} className="gap-2 shadow-md bg-blue-700 hover:bg-blue-800">
            <Plus size={18} /> Crear {activeTab === 'PLATO' ? 'Plato' : 'Producto'}
          </Button>
        )}
      </div>

      {/* ÁREA DE FORMULARIO EXPANDIBLE */}
      {isFormOpen ? (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <ProductoForm 
            tipoActual={activeTab}
            productToEdit={editingProduct} 
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingProduct(null);
            }} 
          />
        </div>
      ) : (
        /* ÁREA DE LISTADO (Se oculta si el formulario está abierto) */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border shadow-sm">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TipoArticulo)} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
                <TabsTrigger value="PLATO" className="font-medium">Platos y Menú</TabsTrigger>
                <TabsTrigger value="PRODUCTO" className="font-medium">Productos y Bebidas</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center w-full sm:w-auto bg-slate-50 px-3 rounded-md border focus-within:ring-1 focus-within:ring-blue-500">
              <Search className="text-slate-400" size={18} />
              <Input 
                placeholder="Buscar..." 
                className="border-none shadow-none bg-transparent focus-visible:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                <tr>
                  <th className="px-5 py-4 w-[80px]">Foto</th>
                  <th className="px-5 py-4">Nombre del {activeTab === 'PLATO' ? 'Plato' : 'Producto'}</th>
                  <th className="px-5 py-4">Categoría</th>
                  <th className="px-5 py-4">Precio Venta</th>
                  
                  {/* COLUMNAS CONDICIONALES */}
                  {activeTab === 'PRODUCTO' && <th className="px-5 py-4 text-center">Stock</th>}
                  {activeTab === 'PRODUCTO' && <th className="px-5 py-4 text-center">Costo</th>}
                  {activeTab === 'PLATO' && <th className="px-5 py-4 text-center">Disponible Hoy</th>}
                  
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className={`group transition-colors hover:bg-slate-50 ${!prod.disponibleHoy && activeTab === 'PLATO' ? 'opacity-60' : ''}`}>
                    
                    <td className="px-5 py-3">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative">
                        {prod.imagenUrl ? (
                          <img src={prod.imagenUrl} alt={prod.nombre} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300">
                            <ImageOff size={18} />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3 font-medium text-slate-900">
                      {prod.nombre}
                    </td>

                    <td className="px-5 py-3">
                      <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600 hover:bg-slate-200">
                        {prod.categoria?.nombre || 'Sin Asignar'}
                      </Badge>
                    </td>

                    <td className="px-5 py-3 font-semibold text-blue-700">
                      S/ {Number(prod.precio).toFixed(2)}
                    </td>

                    {/* VALORES CONDICIONALES */}
                    {activeTab === 'PRODUCTO' && (
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${prod.stock <= 5 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                          {prod.stock} un.
                        </span>
                      </td>
                    )}
                    
                    {activeTab === 'PRODUCTO' && (
                      <td className="px-5 py-3 text-center text-slate-500">
                        S/ {Number(prod.costo).toFixed(2)}
                      </td>
                    )}

                    {activeTab === 'PLATO' && (
                      <td className="px-5 py-3 text-center">
                        <div className="flex justify-center">
                          <Switch 
                            checked={prod.disponibleHoy}
                            onCheckedChange={() => toggleProducto(prod.id)}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </div>
                      </td>
                    )}

                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                            <MoreVertical size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleEdit(prod)} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(prod.id)} className="cursor-pointer text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-slate-50 p-4 rounded-full">
                          <Utensils className="h-8 w-8 opacity-40" />
                        </div>
                        <p>No hay registros en esta sección.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};