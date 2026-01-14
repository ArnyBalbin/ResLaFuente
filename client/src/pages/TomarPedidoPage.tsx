import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useComandaStore } from '@/store/comandaStore';
import { obtenerProductos, obtenerCategorias } from '@/features/productos/productos.api';
import { crearPedido } from '@/features/pedidos/pedidos.api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, ChefHat } from 'lucide-react';

export const TomarPedidoPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { mesaId, items, agregarProducto, eliminarProducto, total, limpiarComanda } = useComandaStore();

  useEffect(() => {
    if (!mesaId) navigate('/mesas');
  }, [mesaId, navigate]);

  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: obtenerCategorias });
  const { data: productos } = useQuery({ queryKey: ['productos'], queryFn: obtenerProductos });

  const mutation = useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      toast.success('¡Pedido enviado a cocina!');
      limpiarComanda(); // Borra el carrito
      navigate('/mesas'); // Vuelve al mapa de mesas
    },
    onError: (error: any) => {
      console.error(error);
      const mensaje = error.response?.data?.message || 'Error al enviar pedido';
      toast.error(mensaje);
    }
  });

  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");

  const productosFiltrados = categoriaActiva === "todos" 
    ? productos 
    : productos?.filter(p => p.categoria?.nombre === categoriaActiva);

  const handleConfirmar = () => {
    if (items.length === 0) return toast.warning('La comanda está vacía');

    const payload = {
      mesaId: mesaId!,
      usuarioId: user?.id || 1,    // TODO: Esto cambiará cuando hagamos Login
      clienteId: 1,    // TODO: Esto cambiará cuando hagamos selección de clientes
      detalles: items.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        notas: item.notas
      }))
    };

    mutation.mutate(payload);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4">
      
      <div className="flex-1 flex flex-col gap-4">
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Menú - Mesa {mesaId}</h2>
        </div>

        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex gap-2">
            <Button 
              variant={categoriaActiva === "todos" ? "default" : "outline"}
              onClick={() => setCategoriaActiva("todos")}
            >
              Todos
            </Button>
            {categorias?.map((cat) => (
              <Button
                key={cat.id}
                variant={categoriaActiva === cat.nombre ? "default" : "outline"}
                onClick={() => setCategoriaActiva(cat.nombre)}
              >
                {cat.nombre}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Grilla de Productos */}
        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {productosFiltrados?.map((producto) => (
              <Card 
                key={producto.id} 
                className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden border-slate-200"
                onClick={() => agregarProducto(producto, 1)}
              >
                <div className="h-32 w-full bg-slate-100 overflow-hidden relative">
                  {producto.imagenUrl ? (
                    <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <ChefHat size={40} />
                    </div>
                  )}
                  <Badge className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/70 text-white border-0">
                    S/ {Number(producto.precio).toFixed(2)}
                  </Badge>
                </div>

                <CardContent className="p-3">
                  <h3 className="font-bold text-sm truncate">{producto.nombre}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {producto.esProductoFinal ? 'Stock: ' + (producto.stock || 0) : 'Cocina'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Card className="w-1/3 min-w-[300px] flex flex-col border-l-4 border-l-blue-600 shadow-xl">
        <CardHeader className="bg-slate-50 border-b pb-3">
          <CardTitle className="flex justify-between items-center text-lg">
            <span>Comanda Actual</span>
            <Badge variant="secondary">Mesa {mesaId}</Badge>
          </CardTitle>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-4">
          {items.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <ChefHat className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p>La comanda está vacía.</p>
              <p className="text-sm">Selecciona productos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.producto.id} className="flex gap-3 items-start animate-in slide-in-from-right-5 fade-in duration-300">
                  <div className="bg-blue-100 text-blue-800 font-bold w-8 h-8 flex items-center justify-center rounded-md text-sm shrink-0">
                    {item.cantidad}x
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">{item.producto.nombre}</p>
                    <p className="text-xs text-slate-500 mt-1">S/ {(Number(item.producto.precio) * item.cantidad).toFixed(2)}</p>
                  </div>

                  <button 
                    onClick={() => eliminarProducto(item.producto.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-slate-50 border-t space-y-3">
          <Separator />
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total:</span>
            <span>S/ {total().toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" onClick={limpiarComanda} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              Cancelar
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handleConfirmar}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Enviando...' : 'Confirmar Pedido'}
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
};