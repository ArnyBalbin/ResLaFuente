import { Users, Clock, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Mesa } from '../types/pos.types';

interface MesaCardProps {
  mesa: Mesa;
  seleccionada: boolean;
  onSelect: (mesa: Mesa) => void;
}

const estadoColores = {
  libre: 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100',
  ocupada: 'border-amber-200 bg-amber-50 hover:border-amber-400 hover:bg-amber-100',
  seleccionada: 'border-blue-500 bg-blue-50 ring-2 ring-blue-400 ring-offset-1',
};

export function MesaCard({ mesa, seleccionada, onSelect }: MesaCardProps) {
  const estado = seleccionada ? 'seleccionada' : mesa.ocupada ? 'ocupada' : 'libre';

  return (
    <button
      onClick={() => onSelect(mesa)}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer w-full aspect-square group',
        estadoColores[estado]
      )}
    >
      {/* Número de mesa */}
      <div className={cn(
        'text-2xl font-bold mb-1',
        estado === 'libre' ? 'text-emerald-700' :
        estado === 'ocupada' ? 'text-amber-700' :
        'text-blue-700'
      )}>
        {mesa.numero}
      </div>

      {/* Capacidad */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <Users size={12} />
        <span>{mesa.capacidad} personas</span>
      </div>

      {/* Badge de estado */}
      <span className={cn(
        'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
        estado === 'libre' ? 'bg-emerald-200 text-emerald-800' :
        estado === 'ocupada' ? 'bg-amber-200 text-amber-800' :
        'bg-blue-200 text-blue-800'
      )}>
        {estado === 'libre' ? 'Libre' : estado === 'ocupada' ? 'Ocupada' : 'Seleccionada'}
      </span>

      {/* Info del pedido activo */}
      {mesa.ocupada && mesa.pedidoActivo && (
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <span className="flex items-center gap-1 text-[10px] text-amber-600">
            <ShoppingBag size={10} />
            {mesa.pedidoActivo._count?.detalles ?? '?'} items
          </span>
          <span className="flex items-center gap-1 text-[10px] text-amber-600">
            <Clock size={10} />
            S/ {Number(mesa.pedidoActivo.total).toFixed(2)}
          </span>
        </div>
      )}
    </button>
  );
}
