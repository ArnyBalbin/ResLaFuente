import { useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, ChefHat, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PedidoCard } from './PedidoCard';
import { usePedidosCocina, useCambiarEstado } from '../hooks/useCocina';
import { ESTADOS_COCINA, ESTADO_CONFIG } from '../types/cocina.types';
import type { EstadoPedido } from '@/types';

const FILTRO_ICONS = {
  PENDIENTE: AlertCircle,
  EN_PROCESO: ChefHat,
  LISTO: CheckCircle2,
};

export function CocinaView() {
  const [filtro, setFiltro] = useState<EstadoPedido | 'TODOS'>('TODOS');
  const [pedidoEnCambio, setPedidoEnCambio] = useState<number | null>(null);

  const { data: pedidos = [], isLoading, refetch } = usePedidosCocina();
  const { mutateAsync: cambiarEstado } = useCambiarEstado();

  const pedidosFiltrados = filtro === 'TODOS'
    ? pedidos
    : pedidos.filter(p => p.estado === filtro);

  const contarPorEstado = (estado: EstadoPedido) =>
    pedidos.filter(p => p.estado === estado).length;

  const handleCambiarEstado = async (id: number, estado: EstadoPedido) => {
    setPedidoEnCambio(id);
    try {
      await cambiarEstado({ id, estado });
      const labels: Record<string, string> = {
        EN_PROCESO: 'Pedido en preparación',
        LISTO: '¡Pedido listo para servir!',
        SERVIDO: 'Pedido servido',
      };
      toast.success(labels[estado] || 'Estado actualizado');
    } catch {
      toast.error('Error al actualizar el estado');
    } finally {
      setPedidoEnCambio(null);
    }
  };

  return (
    <div className="flex flex-col h-full -mt-2">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ChefHat size={24} className="text-primary" />
            Comandas de Cocina
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pedidos.length} pedidos activos · Se actualiza cada 10 segundos
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw size={14} />
          Actualizar
        </Button>
      </div>

      {/* Filtros por estado */}
      <div className="flex gap-2 mb-4 flex-shrink-0 flex-wrap">
        <button
          onClick={() => setFiltro('TODOS')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2',
            filtro === 'TODOS'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
          )}
        >
          Todos
          <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full font-bold">
            {pedidos.length}
          </span>
        </button>

        {ESTADOS_COCINA.map(estado => {
          const config = ESTADO_CONFIG[estado];
          const Icon = FILTRO_ICONS[estado];
          const count = contarPorEstado(estado);
          return (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2',
                filtro === estado
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              )}
            >
              <Icon size={14} />
              {config.label}
              {count > 0 && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-bold',
                  filtro === estado ? 'bg-white/20' : config.badge
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid de pedidos */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <ChefHat size={48} className="mb-3 opacity-20" />
            <p className="font-medium">No hay pedidos {filtro !== 'TODOS' ? `en estado "${ESTADO_CONFIG[filtro as keyof typeof ESTADO_CONFIG]?.label}"` : 'activos'}</p>
            <p className="text-xs mt-1 opacity-70">Los nuevos pedidos aparecerán aquí automáticamente</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pedidosFiltrados.map(pedido => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onCambiarEstado={handleCambiarEstado}
                isLoading={pedidoEnCambio === pedido.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
