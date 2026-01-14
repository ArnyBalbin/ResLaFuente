import { useQuery } from '@tanstack/react-query';
import { obtenerDashboardData } from '@/features/reportes/reportes.api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Utensils, DollarSign, Award } from 'lucide-react';

export const DashboardPage = () => {
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: obtenerDashboardData
  });

  if (isLoading) return <div className="p-10 text-center">Calculando estadísticas...</div>;
  if (!data) return <div className="p-10 text-center">No hay datos disponibles</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-slate-900">Resumen Ejecutivo</h2>

      {/* 1. TARJETAS DE RESUMEN (KPIs) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ {Number(data.ventasHoy).toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Ingresos brutos en caja</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Atendidos</CardTitle>
            <Utensils className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pedidosHoy}</div>
            <p className="text-xs text-slate-500 mt-1">Mesas cerradas hoy</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plato Estrella</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">
              {data.topProductos[0]?.nombre || 'N/A'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {data.topProductos[0]?.cantidad || 0} unidades vendidas (Histórico)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* 2. GRÁFICO PRINCIPAL (Ocupa 4 columnas) */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600"/> 
              Tendencia de Ventas (7 Días)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ventasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="fecha" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `S/ ${value}`} 
                  />
                  <Tooltip 
                    formatter={(value: number | undefined) => [`S/ ${value ?? 0}`, 'Venta']}
                    cursor={{ fill: '#f3f4f6' }}
                  />
                  <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. LISTA DE TOP PRODUCTOS (Ocupa 3 columnas) */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Top 5 Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProductos.map((prod: any, i: number) => (
                <div key={i} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 mr-3 text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{prod.nombre}</p>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(prod.cantidad / (data.topProductos[0].cantidad || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-slate-500 ml-2">
                    {prod.cantidad}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};