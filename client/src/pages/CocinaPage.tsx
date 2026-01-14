import { useQuery } from '@tanstack/react-query';
import { obtenerPedidosCocina } from '@/features/pedidos/pedidos.api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, Utensils } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

export const CocinaPage = () => {

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos-cocina'],
    queryFn: obtenerPedidosCocina,
    refetchInterval: 5000,
  });

  if (isLoading) return <div className="p-10 text-center">Cargando comandas...</div>;

  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400">
        <ChefHat size={64} className="mb-4 opacity-20" />
        <h2 className="text-2xl font-bold">Todo tranquilo en cocina</h2>
        <p>No hay pedidos pendientes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Utensils /> Monitor de Cocina
        </h2>
        <Badge variant="outline" className="text-lg px-4 py-1">
          {pedidos.length} Pendientes
        </Badge>
      </div>

      {/* GRILLA DE COMANDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pedidos.map((pedido: any) => (
          <Card key={pedido.id} className="border-l-4 border-l-orange-500 shadow-md flex flex-col">
            <CardHeader className="bg-orange-50 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Mesa {pedido.mesa.numero}</CardTitle>
                  <p className="text-sm text-slate-500">Mozo: {pedido.usuario?.nombre || 'Admin'}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="font-mono">
                    #{pedido.id.toString().padStart(4, '0')}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-orange-700 font-medium mt-1">
                <Clock size={12} />
                {new Date(pedido.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </CardHeader>
            
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-[200px] p-4">
                <ul className="space-y-3">
                  {pedido.detalles.map((detalle: any) => (
                    <li key={detalle.id} className="text-sm border-b border-dashed pb-2 last:border-0">
                      <div className="flex justify-between font-bold">
                        <span>{detalle.cantidad}x {detalle.producto.nombre}</span>
                      </div>
                      {detalle.notas && (
                        <p className="text-xs text-red-500 italic mt-1 bg-red-50 p-1 rounded">
                          Nota: {detalle.notas}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
            
            {/* Pie de tarjeta: Botón para despachar (Visual por ahora) */}
            <div className="p-3 bg-slate-50 border-t">
               <button className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-md text-sm font-medium transition-colors">
                 Marcar como Listo
               </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};