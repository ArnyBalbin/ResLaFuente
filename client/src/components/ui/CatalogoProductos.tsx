import { useState } from 'react';
import { Search, Plus, ImageOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCategorias, useProductosPorCategoria } from '../hooks/usePos';
import type { Producto } from '@/types';
import type { ItemCarrito } from '../types/pos.types';

interface CatalogoProductosProps {
  onAgregar: (item: Omit<ItemCarrito, 'cantidad'>) => void;
}

export function CatalogoProductos({ onAgregar }: CatalogoProductosProps) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | undefined>(undefined);
  const [busqueda, setBusqueda] = useState('');

  const { data: categorias = [] } = useCategorias();
  const { data: productos = [], isLoading } = useProductosPorCategoria(categoriaSeleccionada);

  const productosFiltrados = productos.filter(p =>
    p.disponibleHoy &&
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleAgregar = (producto: Producto) => {
    onAgregar({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      imagenUrl: producto.imagenUrl,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Buscador */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar platillo..."
          className="pl-9"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Chips de categorías */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        <button
          onClick={() => setCategoriaSeleccionada(undefined)}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
            !categoriaSeleccionada
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
          )}
        >
          Todos
        </button>
        {categorias.filter(c => !c.padreId).map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoriaSeleccionada(cat.id)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap',
              categoriaSeleccionada === cat.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
            )}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <ImageOff size={32} className="mb-2 opacity-30" />
            <p className="text-sm">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {productosFiltrados.map(producto => (
              <button
                key={producto.id}
                onClick={() => handleAgregar(producto)}
                className="relative flex flex-col rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all duration-150 overflow-hidden text-left group"
              >
                {/* Imagen o placeholder */}
                <div className="w-full h-20 bg-muted flex items-center justify-center overflow-hidden">
                  {producto.imagenUrl ? (
                    <img
                      src={producto.imagenUrl}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground/40">
                      <ImageOff size={20} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2 flex-1 flex flex-col justify-between">
                  <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
                    {producto.nombre}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-primary">
                      S/ {Number(producto.precio).toFixed(2)}
                    </span>
                    {producto.controlarStock && (
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                        producto.stock > 5 ? 'bg-emerald-100 text-emerald-700' :
                        producto.stock > 0 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {producto.stock > 0 ? `${producto.stock} left` : 'Sin stock'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botón agregar flotante */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-primary text-primary-foreground rounded-full p-0.5 shadow">
                    <Plus size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
