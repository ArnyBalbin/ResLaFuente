import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard, DollarSign, ShoppingBag, Users, TrendingUp,
  ShoppingCart, RefreshCw, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/api/axios';

// ── Tipos mínimos ────────────────────────────────────────────────────────
interface Pedido {
  id: number;
  total: string;
  fecha: string;
  estado: string;
  tipo: string;
  detalles: { cantidad: number; producto: { nombre: string } }[];
}
interface Cliente { id: number; creadoEn?: string }

// ── Helpers ──────────────────────────────────────────────────────────────
function esHoy(fecha: string) {
  const hoy = new Date();
  const d = new Date(fecha);
  return d.getDate() === hoy.getDate() &&
    d.getMonth() === hoy.getMonth() &&
    d.getFullYear() === hoy.getFullYear();
}

function fechaCorta(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

// ── StatCard ─────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, description, trend, color = 'text-primary' }: any) {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className={cn('h-4 w-4', color)} />
        </div>
      </div>
      <div>
        <p className={cn('text-2xl font-bold', color)}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend && (
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <ArrowUpRight size={11} />{trend}
            </span>
          )}
          {description}
        </p>
      </div>
    </div>
  );
}

// ── Tooltip personalizado ────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-primary">S/ {Number(payload[0].value).toFixed(2)}</p>
    </div>
  );
}

// ── HomePage ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();

  const { data: pedidos = [], isLoading: loadingPedidos, refetch } = useQuery<Pedido[]>({
    queryKey: ['pedidos-dashboard'],
    queryFn: async () => { const { data } = await api.get('/pedidos'); return data; },
    refetchInterval: 30_000,
  });

  const { data: clientes = [], isLoading: loadingClientes } = useQuery<Cliente[]>({
    queryKey: ['clientes-dashboard'],
    queryFn: async () => { const { data } = await api.get('/clientes'); return data; },
  });

  const stats = useMemo(() => {
    const pedidosHoy = pedidos.filter(p => esHoy(p.fecha));
    const ventasHoy = pedidosHoy.reduce((s, p) => s + Number(p.total), 0);
    const pedidosActivos = pedidos.filter(p =>
      ['PENDIENTE', 'EN_PROCESO', 'LISTO'].includes(p.estado)
    ).length;
    const ticketPromedio = pedidosHoy.length > 0 ? ventasHoy / pedidosHoy.length : 0;

    // Ventas últimos 7 días
    const hoy = new Date();
    const ultimos7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - (6 - i));
      const total = pedidos
        .filter(p => {
          const pd = new Date(p.fecha);
          return pd.toDateString() === d.toDateString();
        })
        .reduce((s, p) => s + Number(p.total), 0);
      return {
        fecha: d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
        total,
      };
    });

    // Top 5 productos
    const conteo: Record<string, number> = {};
    pedidos.forEach(p =>
      p.detalles.forEach(d => {
        conteo[d.producto.nombre] = (conteo[d.producto.nombre] || 0) + d.cantidad;
      })
    );
    const top5 = Object.entries(conteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Pedidos por tipo hoy
    const porTipo = {
      MESA: pedidosHoy.filter(p => p.tipo === 'MESA').length,
      LLEVAR: pedidosHoy.filter(p => p.tipo === 'LLEVAR').length,
      DELIVERY: pedidosHoy.filter(p => p.tipo === 'DELIVERY').length,
    };

    return { ventasHoy, pedidosHoy: pedidosHoy.length, pedidosActivos, ticketPromedio, ultimos7, top5, porTipo };
  }, [pedidos, clientes]);

  const isLoading = loadingPedidos || loadingClientes;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Resumen de operaciones del día · {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw size={14} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => navigate('/pos')} className="gap-1.5">
            <ShoppingCart size={14} />
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Ventas del día"
            value={`S/ ${stats.ventasHoy.toFixed(2)}`}
            icon={DollarSign}
            description="Total facturado hoy"
            color="text-emerald-600"
          />
          <StatCard
            title="Pedidos hoy"
            value={stats.pedidosHoy}
            icon={ShoppingBag}
            description={`${stats.pedidosActivos} activos ahora`}
            color="text-blue-600"
          />
          <StatCard
            title="Clientes"
            value={clientes.length}
            icon={Users}
            description="Registrados en total"
            color="text-purple-600"
          />
          <StatCard
            title="Ticket promedio"
            value={`S/ ${stats.ticketPromedio.toFixed(2)}`}
            icon={CreditCard}
            description="Por pedido hoy"
            color="text-primary"
          />
        </div>
      )}

      {/* Gráfico + Top productos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Gráfico de ventas */}
        <div className="col-span-4 rounded-xl border bg-card shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-foreground">Ingresos — Últimos 7 días</h3>
            <p className="text-xs text-muted-foreground">Total en soles por día</p>
          </div>
          {isLoading ? (
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.ultimos7} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="total"
                  stroke="#3b82f6" strokeWidth={2}
                  fill="url(#gradVentas)"
                  dot={{ r: 3, fill: '#3b82f6' }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top productos */}
        <div className="col-span-3 rounded-xl border bg-card shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-foreground">Platos más vendidos</h3>
            <p className="text-xs text-muted-foreground">Basado en todos los pedidos</p>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-muted animate-pulse rounded" />)}
            </div>
          ) : stats.top5.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <TrendingUp size={28} className="mb-2 opacity-20" />
              <p className="text-sm">Sin datos aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.top5.map(([nombre, cantidad], i) => {
                const max = stats.top5[0][1];
                const pct = Math.round((cantidad / max) * 100);
                const colores = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
                return (
                  <div key={nombre}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                        <span className="text-sm font-medium text-foreground truncate max-w-[160px]">{nombre}</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{cantidad} uds</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', colores[i])}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pedidos por tipo + pedidos activos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

        {/* Tipos de pedido hoy */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Pedidos de hoy por tipo</h3>
          <div className="space-y-3">
            {[
              { tipo: 'Mesa', count: stats.porTipo.MESA, color: 'bg-blue-100 text-blue-700' },
              { tipo: 'Para llevar' , count: stats.porTipo.LLEVAR, color: 'bg-amber-100 text-amber-700' },
              { tipo: 'Delivery' , count: stats.porTipo.DELIVERY, color: 'bg-emerald-100 text-emerald-700' },
            ].map(({ tipo,count, color }) => (
              <div key={tipo} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{tipo}</span>
                </div>
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', color)}>
                  {count} pedidos
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pedidos activos */}
        <div className="col-span-2 rounded-xl border bg-card shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Pedidos activos</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/cocina')} className="text-xs gap-1">
              Ver cocina
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1,2].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : pedidos.filter(p => ['PENDIENTE','EN_PROCESO','LISTO'].includes(p.estado)).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
              <ShoppingBag size={24} className="mb-1 opacity-20" />
              <p className="text-sm">No hay pedidos activos</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pedidos
                .filter(p => ['PENDIENTE','EN_PROCESO','LISTO'].includes(p.estado))
                .slice(0, 6)
                .map(p => {
                  const config: Record<string, { label: string; color: string }> = {
                    PENDIENTE:  { label: 'Pendiente',  color: 'bg-amber-100 text-amber-700' },
                    EN_PROCESO: { label: 'En proceso', color: 'bg-blue-100 text-blue-700' },
                    LISTO:      { label: 'Listo',      color: 'bg-emerald-100 text-emerald-700' },
                  };
                  const est = config[p.estado];
                  return (
                    <div key={p.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 border border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {p.tipo === 'MESA' ? '🍽' : p.tipo === 'LLEVAR' ? '🥡' : '🛵'}
                        </span>
                        <span className="text-sm font-medium">Pedido #{p.id}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.detalles.reduce((s, d) => s + d.cantidad, 0)} items
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', est?.color)}>
                          {est?.label}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          S/ {Number(p.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
