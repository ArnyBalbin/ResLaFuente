import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { LayoutGrid, ChefHat, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MesaCard } from './MesaCard';
import { CatalogoProductos } from './CatalogoProductos';
import { CarritoPedido } from './CarritoPedido';
import { OpcionesPedido } from './OpcionesPedido';
import { useMesas, useCrearPedido } from '../hooks/usePos';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { COSTO_LLEVAR } from '../types/pos.types';
import type { Mesa, ItemCarrito, ClienteSimple, EmpresaSimple } from '../types/pos.types';
import type { TipoPedido } from '@/types';

export function PosView() {
  const { usuario } = useAuthStore();
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [vistaMovil, setVistaMovil] = useState<'mesas' | 'catalogo'>('mesas');

  // Opciones del pedido
  const [tipo, setTipo] = useState<TipoPedido>('MESA');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteSimple | null>(null);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<EmpresaSimple | null>(null);
  const [esCredito, setEsCredito] = useState(false);
  const [direccion, setDireccion] = useState('');

  const { data: mesas = [], isLoading: loadingMesas, refetch } = useMesas();
  const { mutateAsync: crearPedido, isPending } = useCrearPedido();
  const qc = useQueryClient();

  // ── Carrito ─────────────────────────────────────────────────────────────
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
      prev.map(i => i.productoId === productoId ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter(i => i.cantidad > 0)
    );
  }, []);

  const eliminarItem = useCallback((productoId: number) => {
    setCarrito(prev => prev.filter(i => i.productoId !== productoId));
  }, []);

  const actualizarNotas = useCallback((productoId: number, notas: string) => {
    setCarrito(prev =>
      prev.map(i => i.productoId === productoId ? { ...i, notas: notas || undefined } : i)
    );
  }, []);

  const limpiarCarrito = useCallback(() => {
    setCarrito([]);
    setClienteSeleccionado(null);
    setEmpresaSeleccionada(null);
    setEsCredito(false);
    setDireccion('');
  }, []);

  // ── Mesas ────────────────────────────────────────────────────────────────
  const seleccionarMesa = useCallback((mesa: Mesa) => {
    setMesaSeleccionada(prev => prev?.id === mesa.id ? null : mesa);
    setVistaMovil('catalogo');
  }, []);

  // ── Enviar pedido ────────────────────────────────────────────────────────
  const enviarPedido = async () => {
    if (tipo === 'MESA' && !mesaSeleccionada) {
      toast.warning('Selecciona una mesa para continuar');
      return;
    }
    if (carrito.length === 0) {
      toast.warning('Agrega productos al pedido');
      return;
    }

    // Calcular costo llevar y agregarlo como nota si aplica
    const costoLlevar = tipo === 'LLEVAR'
      ? carrito.reduce((s, i) => s + i.cantidad, 0) * COSTO_LLEVAR
      : 0;

    try {
      await crearPedido({
        mesaId: mesaSeleccionada?.id,
        tipo,
        direccion: direccion || undefined,
        esCredito,
        usuarioId: usuario!.id,
        clienteId: clienteSeleccionado?.id,
        empresaId: empresaSeleccionada?.id,
        items: carrito.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          ...(item.notas ? { notas: item.notas } : {}),
        })),
      });

      const mesaLabel = mesaSeleccionada ? `Mesa ${mesaSeleccionada.numero}` : tipo;
      const extraMsg = costoLlevar > 0 ? ` · +S/ ${costoLlevar.toFixed(2)} envase` : '';
      toast.success(`¡Pedido ${mesaLabel} enviado a cocina!${extraMsg}`);

      setCarrito([]);
      setMesaSeleccionada(null);
      setClienteSeleccionado(null);
      setEmpresaSeleccionada(null);
      setEsCredito(false);
      setDireccion('');
      qc.invalidateQueries({ queryKey: ['mesas'] });
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al crear el pedido';
      toast.error(typeof msg === 'string' ? msg : msg.join(' · '));
    }
  };

  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);

  return (
    <div className="flex flex-col h-full -mt-2">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Punto de Venta</h1>
          <p className="text-sm text-muted-foreground">
            {mesas.length} mesas · {mesas.filter(m => m.ocupada).length} ocupadas · {mesas.filter(m => !m.ocupada).length} libres
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw size={14} />
          Actualizar
        </Button>
      </div>

      {/* Tabs móvil */}
      <div className="flex gap-2 mb-4 lg:hidden flex-shrink-0">
        <button onClick={() => setVistaMovil('mesas')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${vistaMovil === 'mesas' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <LayoutGrid size={15} /> Mesas
        </button>
        <button onClick={() => setVistaMovil('catalogo')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 relative ${vistaMovil === 'catalogo' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <ChefHat size={15} /> Catálogo
          {totalItems > 0 && (
            <span className="absolute top-1.5 right-3 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Layout principal */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Panel mesas */}
        <div className={`lg:flex flex-col w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 ${vistaMovil === 'mesas' ? 'flex' : 'hidden'}`}>
          <div className="bg-card rounded-xl border p-4 flex flex-col flex-1 min-h-0">
            <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3 flex-shrink-0">
              Mapa de Mesas
            </h2>
            {loadingMesas ? (
              <div className="grid grid-cols-3 gap-2 flex-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1 content-start">
                {mesas.map(mesa => (
                  <MesaCard key={mesa.id} mesa={mesa}
                    seleccionada={mesaSeleccionada?.id === mesa.id}
                    onSelect={seleccionarMesa} />
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-3 pt-3 border-t flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Libre
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ocupada
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Seleccionada
              </div>
            </div>
          </div>
        </div>

        {/* Panel catálogo + opciones + carrito */}
        <div className={`lg:flex flex-1 gap-4 min-h-0 ${vistaMovil === 'catalogo' ? 'flex' : 'hidden'}`}>

          {/* Catálogo */}
          <div className="flex-1 bg-card rounded-xl border p-4 flex flex-col min-h-0">
            <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3 flex-shrink-0">
              Catálogo
              {mesaSeleccionada && (
                <span className="ml-2 normal-case text-primary font-bold">— Mesa {mesaSeleccionada.numero}</span>
              )}
            </h2>
            <CatalogoProductos onAgregar={agregarAlCarrito} />
          </div>

          {/* Panel derecho: opciones + carrito */}
          <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col gap-3 min-h-0">

            {/* Opciones del pedido */}
            <div className="bg-card rounded-xl border p-4 flex-shrink-0">
              <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">
                Opciones
              </h2>
              <OpcionesPedido
                tipo={tipo} onTipoChange={setTipo}
                clienteSeleccionado={clienteSeleccionado} onClienteChange={setClienteSeleccionado}
                empresaSeleccionada={empresaSeleccionada} onEmpresaChange={setEmpresaSeleccionada}
                esCredito={esCredito} onEsCreditoChange={setEsCredito}
                direccion={direccion} onDireccionChange={setDireccion}
              />
            </div>

            {/* Carrito */}
            <div className="bg-card rounded-xl border p-4 flex flex-col flex-1 min-h-0">
              <CarritoPedido
                items={carrito}
                mesaSeleccionada={mesaSeleccionada}
                tipo={tipo}
                onCambiarCantidad={cambiarCantidad}
                onEliminar={eliminarItem}
                onActualizarNotas={actualizarNotas}
                onEnviarPedido={enviarPedido}
                onLimpiar={limpiarCarrito}
                isLoading={isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
