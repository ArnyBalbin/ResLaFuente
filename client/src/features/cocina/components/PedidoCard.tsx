import { Clock, ChefHat, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ESTADO_CONFIG, SIGUIENTE_ESTADO } from '../types/cocina.types';
import type { PedidoCocina } from '../types/cocina.types';
import type { EstadoPedido } from '@/types';

interface PedidoCardProps {
  pedido: PedidoCocina;
  onCambiarEstado: (id: number, estado: EstadoPedido) => void;
  isLoading: boolean;
}

function tiempoTranscurrido(fecha: string): string {
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  return `${Math.floor(diff / 3600)}h`;
}

function esUrgente(fecha: string): boolean {
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000 / 60);
  return diff > 15;
}

export function PedidoCard({ pedido, onCambiarEstado, isLoading }: PedidoCardProps) {
  const config = ESTADO_CONFIG[pedido.estado as keyof typeof ESTADO_CONFIG];
  const siguienteEstado = SIGUIENTE_ESTADO[pedido.estado];
  const urgente = esUrgente(pedido.fecha) && pedido.estado === 'PENDIENTE';

  return (
    <div className={cn(
      'rounded-xl border-2 p-4 flex flex-col gap-3 transition-all duration-200 shadow-sm',
      config.color,
      urgente && 'ring-2 ring-red-400 ring-offset-1'
    )}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              {pedido.mesa ? `Mesa ${pedido.mesa.numero}` : pedido.tipo}
            </span>
            {urgente && (
              <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                URGENTE
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pedido #{pedido.id} · {pedido.usuario.nombre}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={cn('text-[11px] font-semibold px-2 py-1 rounded-full', config.badge)}>
            <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1', config.dot)} />
            {config.label}
          </span>
          <span className={cn(
            'flex items-center gap-1 text-xs font-medium',
            urgente ? 'text-red-600' : 'text-muted-foreground'
          )}>
            <Clock size={11} />
            {tiempoTranscurrido(pedido.fecha)}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white/60 rounded-lg p-3 space-y-2">
        {pedido.detalles
          .filter(d => !d.hijos || d.hijos.length === 0 ? true : true)
          .map(detalle => (
            <div key={detalle.id} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                {detalle.cantidad}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {detalle.producto.nombre}
                </p>
                {detalle.notas && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 inline-block">
                    📝 {detalle.notas}
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Botón acción */}
      {siguienteEstado && (
        <button
          onClick={() => onCambiarEstado(pedido.id, siguienteEstado)}
          disabled={isLoading}
          className={cn(
            'w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all',
            config.boton,
            isLoading && 'opacity-60 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <ChefHat size={15} />
          )}
          {config.accion}
        </button>
      )}
    </div>
  );
}
