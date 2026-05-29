import { useState } from 'react';
import { Search, User, Building2, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useClientes, useEmpresas } from '../hooks/usePos';
import type { ClienteSimple, EmpresaSimple } from '../types/pos.types';
import type { TipoPedido } from '@/types';

interface OpcionesPedidoProps {
  tipo: TipoPedido;
  onTipoChange: (tipo: TipoPedido) => void;
  clienteSeleccionado: ClienteSimple | null;
  onClienteChange: (cliente: ClienteSimple | null) => void;
  empresaSeleccionada: EmpresaSimple | null;
  onEmpresaChange: (empresa: EmpresaSimple | null) => void;
  esCredito: boolean;
  onEsCreditoChange: (v: boolean) => void;
  direccion: string;
  onDireccionChange: (v: string) => void;
}

type ModoAsignacion = 'ninguno' | 'cliente' | 'empresa';

export function OpcionesPedido({
  tipo, onTipoChange,
  clienteSeleccionado, onClienteChange,
  empresaSeleccionada, onEmpresaChange,
  esCredito, onEsCreditoChange,
  direccion, onDireccionChange,
}: OpcionesPedidoProps) {
  const [modo, setModo] = useState<ModoAsignacion>('ninguno');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaEmpresa, setBusquedaEmpresa] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  const { data: clientes = [] } = useClientes();
  const { data: empresas = [] } = useEmpresas();

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    c.dni?.includes(busquedaCliente)
  );

  const empresasFiltradas = empresas.filter(e =>
    e.razonSocial.toLowerCase().includes(busquedaEmpresa.toLowerCase()) ||
    e.ruc.includes(busquedaEmpresa)
  );

  const cambiarModo = (nuevoModo: ModoAsignacion) => {
    setModo(nuevoModo);
    setMostrarDropdown(nuevoModo !== 'ninguno');
    if (nuevoModo !== 'cliente') { onClienteChange(null); setBusquedaCliente(''); }
    if (nuevoModo !== 'empresa') { onEmpresaChange(null); setBusquedaEmpresa(''); onEsCreditoChange(false); }
  };

  const seleccionarCliente = (cliente: ClienteSimple) => {
    onClienteChange(cliente);
    setBusquedaCliente(cliente.nombre);
    setMostrarDropdown(false);
    // Si el cliente tiene empresa, preseleccionarla
    if (cliente.empresa) {
      onEmpresaChange(cliente.empresa);
    }
  };

  const seleccionarEmpresa = (empresa: EmpresaSimple) => {
    onEmpresaChange(empresa);
    setBusquedaEmpresa(empresa.razonSocial);
    setMostrarDropdown(false);
  };

  return (
    <div className="space-y-3">

      {/* ── Tipo de pedido ─────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
          Tipo de pedido
        </p>
        <div className="grid grid-cols-3 gap-1">
          {(['MESA', 'LLEVAR', 'DELIVERY'] as TipoPedido[]).map(t => (
            <button
              key={t}
              onClick={() => onTipoChange(t)}
              className={cn(
                'py-1.5 rounded-lg text-xs font-medium border transition-all',
                tipo === t
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              )}
            >
              {t === 'MESA' ? '🍽 Mesa' : t === 'LLEVAR' ? '🥡 Llevar' : '🛵 Delivery'}
            </button>
          ))}
        </div>

        {/* Dirección si es delivery */}
        {(tipo === 'DELIVERY' || tipo === 'LLEVAR') && tipo === 'DELIVERY' && (
          <Input
            className="mt-2 text-xs"
            placeholder="Dirección de entrega..."
            value={direccion}
            onChange={e => onDireccionChange(e.target.value)}
          />
        )}

        {/* Aviso costo llevar */}
        {tipo === 'LLEVAR' && (
          <p className="text-[10px] text-amber-600 bg-amber-50 rounded px-2 py-1 mt-1.5">
            +S/ 2.00 por plato (costo de envase)
          </p>
        )}
      </div>

      {/* ── Asignación cliente/empresa ──────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
          Asignar a
        </p>
        <div className="grid grid-cols-3 gap-1 mb-2">
          {(['ninguno', 'cliente', 'empresa'] as ModoAsignacion[]).map(m => (
            <button
              key={m}
              onClick={() => cambiarModo(m)}
              className={cn(
                'py-1.5 rounded-lg text-xs font-medium border transition-all',
                modo === m
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              )}
            >
              {m === 'ninguno' ? '— Ninguno' : m === 'cliente' ? '👤 Cliente' : '🏢 Empresa'}
            </button>
          ))}
        </div>

        {/* Buscador cliente */}
        {modo === 'cliente' && (
          <div className="relative">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-7 text-xs h-8"
                placeholder="Buscar por nombre o DNI..."
                value={busquedaCliente}
                onChange={e => { setBusquedaCliente(e.target.value); setMostrarDropdown(true); }}
                onFocus={() => setMostrarDropdown(true)}
              />
              {clienteSeleccionado && (
                <button onClick={() => { onClienteChange(null); setBusquedaCliente(''); }} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X size={12} className="text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            {mostrarDropdown && clientesFiltrados.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {clientesFiltrados.map(c => (
                  <button
                    key={c.id}
                    onClick={() => seleccionarCliente(c)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left transition-colors"
                  >
                    <User size={12} className="text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{c.nombre}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {c.dni && `DNI: ${c.dni}`}
                        {c.empresa && ` · ${c.empresa.razonSocial}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {clienteSeleccionado && (
              <div className="mt-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-blue-800">{clienteSeleccionado.nombre}</p>
                {clienteSeleccionado.empresa && (
                  <p className="text-[10px] text-blue-600">{clienteSeleccionado.empresa.razonSocial}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Buscador empresa */}
        {modo === 'empresa' && (
          <div className="relative">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-7 text-xs h-8"
                placeholder="Buscar por razón social o RUC..."
                value={busquedaEmpresa}
                onChange={e => { setBusquedaEmpresa(e.target.value); setMostrarDropdown(true); }}
                onFocus={() => setMostrarDropdown(true)}
              />
              {empresaSeleccionada && (
                <button onClick={() => { onEmpresaChange(null); setBusquedaEmpresa(''); onEsCreditoChange(false); }} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X size={12} className="text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            {mostrarDropdown && empresasFiltradas.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {empresasFiltradas.map(e => (
                  <button
                    key={e.id}
                    onClick={() => seleccionarEmpresa(e)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left transition-colors"
                  >
                    <Building2 size={12} className="text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{e.razonSocial}</p>
                      <p className="text-[10px] text-muted-foreground">
                        RUC: {e.ruc}
                        {e.tieneCredito && ` · Crédito disponible: S/ ${(Number(e.limiteCredito) - Number(e.creditoUsado)).toFixed(2)}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {empresaSeleccionada && (
              <div className="mt-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-blue-800">{empresaSeleccionada.razonSocial}</p>
                <p className="text-[10px] text-blue-600">RUC: {empresaSeleccionada.ruc}</p>
                {empresaSeleccionada.tieneCredito && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="esCredito"
                      checked={esCredito}
                      onChange={e => onEsCreditoChange(e.target.checked)}
                      className="w-3 h-3 accent-primary"
                    />
                    <label htmlFor="esCredito" className="text-[10px] text-blue-700 font-medium cursor-pointer">
                      Cargar a cuenta de crédito
                      <span className="ml-1 text-blue-500">
                        (Disponible: S/ {(Number(empresaSeleccionada.limiteCredito) - Number(empresaSeleccionada.creditoUsado)).toFixed(2)})
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
