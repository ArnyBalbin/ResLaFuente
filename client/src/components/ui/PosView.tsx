import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { LayoutGrid, ChefHat, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MesaCard } from './MesaCard';
import { CatalogoProductos } from './CatalogoProductos';
import { CarritoPedido } from './CarritoPedido';
import { useMesas, useCrearPedido } from '../hooks/usePos';
import type { Mesa, ItemCarrito } from '../types/pos.types';
import { useQueryClient } from '@tanstack/react-query';

export function PosView() {
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [vistaMovil, setVistaMovil] = useState<'mesas' | 'catalogo'>('mesas');

  const { data: mesas = [], isLoading: loadingMesas, refetch } = useMesas();
  const { mutateAsync: crearPedido, isPending } = useCrearPedido();
  const qc = useQueryClient();

  // ── Manejo del carrito ──────────────────────────────────────────────────
  const agregarAlCarrito = useCallback((item: Omit<ItemCarrito, 'cantidad'>) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.productoId === item.productoId);
      if (existe) {
        return prev.map(i =>
          i.productoId === item.productoId ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  }, []);

  const cambiarCantidad = useCallback((productoId: number, delta: number) => {
    setCarrito(prev =>
      prev
        .map(i => i.productoId === productoId ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter(i => i.cantidad > 0)
    );
  }, []);

  const eliminarItem = useCallback((productoId: number) => {
    setCarrito(prev => prev.filter(i => i.productoId !== productoId));
  }, []);

  const limpiarCarrito = useCallback(() => setCarrito([]), []);

  // ── Selección de mesa ───────────────────────────────────────────────────
  const seleccionarMesa = useCallback((mesa: Mesa) => {
    setMesaSeleccionada(prev => prev?.id === mesa.id ? null : mesa);
    // En móvil, ir al catálogo al seleccionar mesa
    setVistaMovil('catalogo');
  }, []);

  // ── Enviar pedido ───────────────────────────────────────────────────────
  const enviarPedido = async () => {
    if (!mesaSeleccionada) {
      toast.warning('Selecciona una mesa para continuar');
      return;
    }
    if (carrito.length === 0) {
      toast.warning('Agrega productos al pedido');
      return;
    }

    try {
      await crearPedido({
        mesaId: mesaSeleccionada.id,
        tipo: 'MESA',
        detalles: carrito.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
          notas: item.notas,
        })),
      });

      toast.success(`¡Pedido de Mesa ${mesaSeleccionada.numero} enviado a cocina!`);
      setCarrito([]);
      setMesaSeleccionada(null);
      qc.invalidateQueries({ queryKey: ['mesas'] });
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al crear el pedido';
      toast.error(msg);
    }
  };

  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);

  return (
    <div className="flex flex-col h-full -mt-2">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Punto de Venta</h1>
          <p className="text-sm text-muted-foreground">
            {mesas.length} mesas · {mesas.filter(m => m.ocupada).length} ocupadas ·{' '}
            {mesas.filter(m => !m.ocupada).length} libres
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw size={14} />
          Actualizar
        </Button>
      </div>

      {/* ── Tabs móvil ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-4 lg:hidden flex-shrink-0">
        <button
          onClick={() => setVistaMovil('mesas')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            vistaMovil === 'mesas'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <LayoutGrid size={15} />
          Mesas
        </button>
        <button
          onClick={() => setVistaMovil('catalogo')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 relative ${
            vistaMovil === 'catalogo'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <ChefHat size={15} />
          Catálogo
          {totalItems > 0 && (
            <span className="absolute top-1.5 right-3 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* ── Layout principal ────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Panel mesas — oculto en móvil si está en catálogo */}
        <div className={`
          lg:flex flex-col w-full lg:w-[340px] xl:w-[380px] flex-shrink-0
          ${vistaMovil === 'mesas' ? 'flex' : 'hidden'}
        `}>
          <div className="bg-card rounded-xl border border-border p-4 flex flex-col flex-1 min-h-0">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex-shrink-0">
              Mapa de Mesas
            </h2>

            {loadingMesas ? (
              <div className="grid grid-cols-3 gap-2 flex-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1">
                {mesas.map(mesa => (
                  <MesaCard
                    key={mesa.id}
                    mesa={mesa}
                    seleccionada={mesaSeleccionada?.id === mesa.id}
                    onSelect={seleccionarMesa}
                  />
                ))}
              </div>
            )}

            {/* Leyenda */}
            <div className="flex gap-3 mt-3 pt-3 border-t border-border flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-emerald-400" /> Libre
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-amber-400" /> Ocupada
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-blue-500" /> Seleccionada
              </div>
            </div>
          </div>
        </div>

        {/* Panel catálogo + carrito — oculto en móvil si está en mesas */}
        <div className={`
          lg:flex flex-1 gap-4 min-h-0
          ${vistaMovil === 'catalogo' ? 'flex' : 'hidden'}
        `}>

          {/* Catálogo de productos */}
          <div className="flex-1 bg-card rounded-xl border border-border p-4 flex flex-col min-h-0">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex-shrink-0">
              Catálogo
              {mesaSeleccionada && (
                <span className="ml-2 normal-case text-primary font-bold">
                  — Mesa {mesaSeleccionada.numero}
                </span>
              )}
            </h2>
            <CatalogoProductos onAgregar={agregarAlCarrito} />
          </div>

          {/* Carrito */}
          <div className="w-72 xl:w-80 flex-shrink-0 bg-card rounded-xl border border-border p-4 flex flex-col min-h-0">
            <CarritoPedido
              items={carrito}
              mesaSeleccionada={mesaSeleccionada}
              onCambiarCantidad={cambiarCantidad}
              onEliminar={eliminarItem}
              onEnviarPedido={enviarPedido}
              onLimpiar={limpiarCarrito}
              isLoading={isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
