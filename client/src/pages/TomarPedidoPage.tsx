import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useComandaStore } from '@/store/comandaStore';
import { obtenerProductos, obtenerCategorias } from '@/features/productos/productos.api';
import { crearPedido } from '@/features/pedidos/pedidos.api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Trash2, ChefHat, Minus, Plus, ShoppingBag, Utensils, Bike, MapPin } from 'lucide-react';

export const TomarPedidoPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { mesaId, items, agregarProducto, eliminarProducto, total, limpiarComanda } = useComandaStore();

  const [tipoPedido, setTipoPedido] = useState<'MESA' | 'LLEVAR' | 'DELIVERY'>('MESA');
  const [direccion, setDireccion] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [cantidadTemp, setCantidadTemp] = useState(1);
  const [notaTemp, setNotaTemp] = useState('');

  useEffect(() => {
    if (tipoPedido === 'MESA' && !mesaId) {
      navigate('/mesas');
    }
  }, [mesaId, navigate, tipoPedido]);

  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: obtenerCategorias });
  const { data: productos } = useQuery({ queryKey: ['productos'], queryFn: obtenerProductos });

  const mutation = useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      toast.success('¡Pedido enviado a cocina!');
      limpiarComanda();
      navigate('/mesas');
    },
    onError: (error: any) => {
      const mensaje = error.response?.data?.message || 'Error al enviar pedido';
      toast.error(mensaje);
    }
  });

  const productosFiltrados = categoriaActiva === "todos"
    ? productos
    : productos?.filter((p: any) => p.categoria?.nombre === categoriaActiva);

  const abrirModal = (producto: any) => {
    setProductoSeleccionado(producto);
    setCantidadTemp(1);
    setNotaTemp('');
    setModalOpen(true);
  };

  const confirmarAgregar = () => {
    if (productoSeleccionado) {
      agregarProducto(productoSeleccionado, cantidadTemp, notaTemp);
      setModalOpen(false);
      toast.success(`${productoSeleccionado.nombre} agregado`);
    }
  };

  const handleConfirmar = () => {
    if (items.length === 0) return toast.warning('La comanda está vacía');
    if (tipoPedido === 'DELIVERY' && !direccion) return toast.warning('Falta la dirección de entrega');

    const payload = {
      mesaId: tipoPedido === 'MESA' ? mesaId! : undefined,
      usuarioId: user?.id || 1,
      clienteId: 1,
      tipo: tipoPedido,
      direccion: tipoPedido === 'DELIVERY' ? direccion : undefined,
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

        <div className="bg-white p-3 rounded-lg border shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {tipoPedido === 'MESA' ? (
                <>🍽️ Mesa <Badge className="text-lg">{mesaId}</Badge></>
              ) : (
                <>{tipoPedido === 'DELIVERY' ? '🛵 Delivery' : '🛍️ Para Llevar'}</>
              )}
            </h2>

            <Tabs value={tipoPedido} onValueChange={(v: any) => setTipoPedido(v)}>
              <TabsList>
                <TabsTrigger value="MESA"><Utensils size={14} className="mr-2" /> Mesa</TabsTrigger>
                <TabsTrigger value="LLEVAR"><ShoppingBag size={14} className="mr-2" /> Llevar</TabsTrigger>
                <TabsTrigger value="DELIVERY"><Bike size={14} className="mr-2" /> Delivery</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {tipoPedido === 'DELIVERY' && (
            <div className="flex items-center gap-2 animate-in slide-in-from-top-2">
              <MapPin className="text-slate-400" />
              <Input
                placeholder="Ingrese dirección del cliente..."
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="bg-slate-50"
              />
            </div>
          )}
        </div>

        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex gap-2">
            <Button
              variant={categoriaActiva === "todos" ? "default" : "outline"}
              onClick={() => setCategoriaActiva("todos")}
              className="rounded-full"
            >
              Todos
            </Button>
            {categorias?.map((cat: any) => (
              <Button
                key={cat.id}
                variant={categoriaActiva === cat.nombre ? "default" : "outline"}
                onClick={() => setCategoriaActiva(cat.nombre)}
                className="rounded-full"
              >
                {cat.nombre}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {productosFiltrados?.map((producto: any) => (
              <Card
                key={producto.id}
                className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden border-slate-200 active:scale-95"
                onClick={() => abrirModal(producto)}
              >
                <div className="h-32 w-full bg-slate-100 overflow-hidden relative">
                  {producto.imagenUrl ? (
                    <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <ChefHat size={40} />
                    </div>
                  )}
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0">
                    S/ {Number(producto.precio).toFixed(2)}
                  </Badge>
                </div>

                <CardContent className="p-3">
                  <h3 className="font-bold text-sm truncate">{producto.nombre}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {producto.esProductoFinal ? `Stock: ${producto.stock || 0}` : 'Cocina'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <Card className="w-1/3 min-w-[300px] flex flex-col border-l-4 border-l-blue-600 shadow-xl z-10">
        <CardHeader className="bg-slate-50 border-b pb-3">
          <CardTitle className="flex justify-between items-center text-lg">
            <span>Comanda</span>
            <Badge variant="secondary">{items.length} ítems</Badge>
          </CardTitle>
        </CardHeader>

        <ScrollArea className="flex-1 p-4">
          {items.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <ChefHat className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p>Comanda vacía.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.producto.id} className="flex gap-3 items-start animate-in slide-in-from-right-5">
                  <div className="bg-blue-100 text-blue-800 font-bold w-8 h-8 flex items-center justify-center rounded-md text-sm shrink-0">
                    {item.cantidad}x
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">{item.producto.nombre}</p>
                    <p className="text-xs text-slate-500 mt-1">S/ {(Number(item.producto.precio) * item.cantidad).toFixed(2)}</p>

                    {/* MOSTRAR NOTA SI EXISTE */}
                    {/* BIEN */}
                    {item.notas && (
                      <div className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded mt-1 border border-yellow-100 italic flex items-center gap-1">
                        <span>✏️</span> {item.notas}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => eliminarProducto(item.producto.id, item.notas)}
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
            <Button variant="outline" onClick={limpiarComanda} className="text-red-500 hover:bg-red-50">
              Cancelar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleConfirmar}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Enviando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Card>

      {/* --- MODAL PARA AGREGAR PRODUCTO CON NOTAS --- */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              {productoSeleccionado?.nombre}
              <span className="text-blue-600">S/ {Number(productoSeleccionado?.precio).toFixed(2)}</span>
            </DialogTitle>
            <DialogDescription>
              Personaliza el pedido para la cocina.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Cantidad */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => setCantidadTemp(Math.max(1, cantidadTemp - 1))}>
                <Minus size={18} />
              </Button>
              <span className="text-3xl font-bold w-12 text-center">{cantidadTemp}</span>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => setCantidadTemp(cantidadTemp + 1)}>
                <Plus size={18} />
              </Button>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="nota" className="text-right">
                Notas (Opcional)
              </Label>
              <Input
                id="nota"
                placeholder="Ej: Sin sal, término medio..."
                value={notaTemp}
                onChange={(e) => setNotaTemp(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={confirmarAgregar} className="w-full bg-green-600 hover:bg-green-700">
              Agregar a Comanda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};