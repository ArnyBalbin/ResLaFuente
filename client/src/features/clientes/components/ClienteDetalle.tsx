import { X, Building2, Phone, Mail, MapPin, CreditCard, ShoppingBag, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePedidosCliente } from '../hooks/useClientes';
import type { Cliente } from '../types/clientes.types';

interface ClienteDetalleProps {
  cliente: Cliente;
  onClose: () => void;
}

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  PENDIENTE:  { label: 'Pendiente',  color: 'bg-amber-100 text-amber-800' },
  EN_PROCESO: { label: 'En proceso', color: 'bg-blue-100 text-blue-800' },
  LISTO:      { label: 'Listo',      color: 'bg-emerald-100 text-emerald-800' },
  SERVIDO:    { label: 'Servido',    color: 'bg-purple-100 text-purple-800' },
  CERRADO:    { label: 'Cerrado',    color: 'bg-gray-100 text-gray-700' },
  CANCELADO:  { label: 'Cancelado',  color: 'bg-red-100 text-red-700' },
};

const TIPO_ICON: Record<string, string> = {
  MESA: '🍽', LLEVAR: '🥡', DELIVERY: '🛵',
};

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function ClienteDetalle({ cliente, onClose }: ClienteDetalleProps) {
  const { data: pedidos = [], isLoading } = usePedidosCliente(cliente.id);

  const totalGastado = pedidos.reduce((sum, p) => sum + Number(p.total), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-bold text-xl text-foreground">{cliente.nombre}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {cliente.dni && `DNI: ${cliente.dni}`}
              {cliente.ruc && ` · RUC: ${cliente.ruc}`}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground mt-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Info de contacto */}
          <div className="grid grid-cols-2 gap-3">
            {cliente.telefono && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14} className="text-primary flex-shrink-0" />
                {cliente.telefono}
              </div>
            )}
            {cliente.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} className="text-primary flex-shrink-0" />
                {cliente.email}
              </div>
            )}
            {cliente.direccion && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                <MapPin size={14} className="text-primary flex-shrink-0" />
                {cliente.direccion}
              </div>
            )}
          </div>

          {/* Convenios con empresas */}
          {cliente.convenios.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Convenios con empresas
              </h3>
              {cliente.convenios.map(conv => (
                <div key={conv.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 size={15} className="text-blue-600" />
                      <span className="text-sm font-bold text-blue-900">{conv.empresa.razonSocial}</span>
                    </div>
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-semibold',
                      conv.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {conv.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600">RUC: {conv.empresa.ruc}</p>
                  <div className="mt-2 flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={12} className="text-blue-500" />
                      <span className="text-xs text-blue-700">
                        Límite diario: S/ {Number(conv.limiteDiario).toFixed(2)}
                      </span>
                    </div>
                    {conv.empresa.tieneCredito && (
                      <>
                        <span className="text-xs text-blue-700">
                          Crédito empresa: S/ {Number(conv.empresa.limiteCredito).toFixed(2)}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700">
                          Disponible: S/ {(Number(conv.empresa.limiteCredito) - Number(conv.empresa.creditoUsado)).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/40 rounded-lg p-3 text-center border border-border">
              <p className="text-xl font-bold text-primary">S/ {totalGastado.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total gastado</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-center border border-border">
              <p className="text-xl font-bold text-foreground">{pedidos.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pedidos totales</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-center border border-border">
              <p className="text-xl font-bold text-foreground">
                {pedidos.length > 0 ? `S/ ${(totalGastado / pedidos.length).toFixed(2)}` : 'S/ 0.00'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Ticket promedio</p>
            </div>
          </div>

          {/* Historial de pedidos */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Historial de pedidos
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
              </div>
            ) : pedidos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground border border-dashed border-border rounded-lg">
                <ShoppingBag size={28} className="mb-2 opacity-20" />
                <p className="text-sm">Sin pedidos registrados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pedidos.map(pedido => {
                  const config = ESTADO_CONFIG[pedido.estado] || { label: pedido.estado, color: 'bg-gray-100 text-gray-700' };
                  return (
                    <div key={pedido.id} className="border border-border rounded-lg p-3 bg-muted/20">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{TIPO_ICON[pedido.tipo] || '📦'}</span>
                          <span className="text-sm font-medium text-foreground">
                            Pedido #{pedido.id}
                            {pedido.mesa && ` · Mesa ${pedido.mesa.numero}`}
                          </span>
                          {pedido.esCredito && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                              Crédito
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', config.color)}>
                            {config.label}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            S/ {Number(pedido.total).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5 mb-2">
                        {pedido.detalles.map(d => (
                          <div key={d.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground flex-shrink-0">
                              {d.cantidad}
                            </span>
                            <span>{d.producto.nombre}</span>
                            {d.notas && <span className="text-amber-600">· {d.notas}</span>}
                            <span className="ml-auto">S/ {(Number(d.precioUnitario) * d.cantidad).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock size={10} />
                        {formatFecha(pedido.fecha)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
