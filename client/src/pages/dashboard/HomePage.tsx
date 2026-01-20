import { 
  CreditCard, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp 
} from 'lucide-react';
import { Button } from '../../components/ui/button';

function StatCard({ title, value, icon: Icon, description, trend }: any) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-primary">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {trend && <span className="text-green-600 font-medium">{trend} </span>}
          {description}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      
      {/* Cabecera de Página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de operaciones del día.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">Descargar Reporte</Button>
           <Button>Nueva Venta</Button>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Ventas Totales" 
          value="S/ 1,250.00" 
          icon={DollarSign} 
          description="vs ayer" 
          trend="+20.1%" 
        />
        <StatCard 
          title="Pedidos" 
          value="+45" 
          icon={ShoppingBag} 
          description="En turno actual" 
        />
        <StatCard 
          title="Clientes Nuevos" 
          value="+12" 
          icon={Users} 
          description="Registrados hoy" 
          trend="+4%" 
        />
        <StatCard 
          title="Ticket Promedio" 
          value="S/ 35.00" 
          icon={CreditCard} 
          description="Por mesa" 
        />
      </div>

      {/* Gráfico Placeholder (Aquí iría Recharts) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Resumen de Ingresos</h3>
            <p className="text-sm text-muted-foreground">Últimos 7 días</p>
          </div>
          <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground">
             <TrendingUp className="mr-2 h-5 w-5" />
             Gráfico de Ventas (Próximamente con Recharts)
          </div>
        </div>

        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="mb-4">
             <h3 className="text-lg font-medium">Platos Más Vendidos</h3>
             <p className="text-sm text-muted-foreground">Top 5 del mes</p>
          </div>
          <div className="space-y-4">
             {/* Mock List */}
             {["Lomo Saltado", "Ají de Gallina", "Ceviche Mixto", "Milanesa de Pollo", "Chaufa"].map((plato, i) => (
               <div key={i} className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mr-2" />
                  <div className="flex-1 text-sm font-medium">{plato}</div>
                  <div className="text-sm text-muted-foreground">{20 - i * 3} ventas</div>
               </div>
             ))}
          </div>
        </div>
      </div>

    </div>
  );
}