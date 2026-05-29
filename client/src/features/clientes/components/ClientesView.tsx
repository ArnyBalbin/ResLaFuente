import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Search, Plus, Users, Building2, Phone, Eye, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useClientes, useEliminarCliente } from '../hooks/useClientes';
import { ClienteModal } from './ClienteModal';
import { ClienteDetalle } from './ClienteDetalle';
import type { Cliente } from '../types/clientes.types';

export function ClientesView() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState<'todos' | 'con' | 'sin'>('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);
  const [clienteDetalle, setClienteDetalle] = useState<Cliente | null>(null);

  const { data: clientes = [], isLoading, refetch } = useClientes();
  const { mutateAsync: eliminar } = useEliminarCliente();

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
      const coincideBusqueda =
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.dni?.includes(busqueda) ||
        c.telefono?.includes(busqueda);
      const coincideEmpresa =
        filtroEmpresa === 'todos' ? true :
        filtroEmpresa === 'con' ? c.convenios.length > 0 :
        c.convenios.length === 0;
      return coincideBusqueda && coincideEmpresa;
    });
  }, [clientes, busqueda, filtroEmpresa]);

  const handleEliminar = async (cliente: Cliente) => {
    if (!confirm(`¿Eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminar(cliente.id);
      toast.success('Cliente eliminado');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error al eliminar');
    }
  };

  const abrirEditar = (cliente: Cliente) => {
    setClienteEditar(cliente);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setClienteEditar(null);
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users size={22} className="text-primary" />
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {clientes.length} clientes registrados · {clientes.filter(c => c.convenios.length > 0).length} vinculados a empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw size={14} />
          </Button>
          <Button size="sm" onClick={() => setModalAbierto(true)} className="gap-1.5">
            <Plus size={15} />
            Nuevo cliente
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI o teléfono..."
            className="pl-8"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {(['todos', 'con', 'sin'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltroEmpresa(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                filtroEmpresa === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              )}
            >
              {f === 'todos' ? 'Todos' : f === 'con' ? '🏢 Con empresa' : '👤 Sin empresa'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border border-dashed border-border rounded-xl">
          <Users size={36} className="mb-2 opacity-20" />
          <p className="font-medium">No hay clientes</p>
          <p className="text-xs mt-1 opacity-70">
            {busqueda ? 'Intenta con otra búsqueda' : 'Crea el primer cliente'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">Cliente</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide hidden md:table-cell">Contacto</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">Empresa</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente, i) => (
                <tr
                  key={cliente.id}
                  className={cn(
                    'border-b border-border/60 hover:bg-muted/30 transition-colors',
                    i === clientesFiltrados.length - 1 && 'border-b-0'
                  )}
                >
                  {/* Nombre + DNI */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {cliente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{cliente.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {cliente.dni ? `DNI: ${cliente.dni}` : 'Sin DNI'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contacto */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {cliente.telefono && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone size={11} />
                          {cliente.telefono}
                        </div>
                      )}
                      {cliente.email && (
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">{cliente.email}</p>
                      )}
                      {!cliente.telefono && !cliente.email && (
                        <p className="text-xs text-muted-foreground">Sin contacto</p>
                      )}
                    </div>
                  </td>

                  {/* Empresa */}
                  <td className="px-4 py-3">
                    {cliente.convenios.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-blue-700">
                            {cliente.convenios[0].empresa.razonSocial}
                          </p>
                          <p className="text-[10px] text-blue-500">
                            Límite: S/ {Number(cliente.convenios[0].limiteDiario).toFixed(2)}/día
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">— Sin empresa</span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setClienteDetalle(cliente)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                        title="Ver historial"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => abrirEditar(cliente)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleEliminar(cliente)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <ClienteModal cliente={clienteEditar} onClose={cerrarModal} />
      )}
      {clienteDetalle && (
        <ClienteDetalle cliente={clienteDetalle} onClose={() => setClienteDetalle(null)} />
      )}
    </div>
  );
}
