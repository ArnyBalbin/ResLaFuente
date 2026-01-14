import { useState } from 'react';
import { obtenerPedidoActivo } from '@/features/pagos/pagos.api';
import { PagarModal } from '@/components/modals/PagarModal';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { obtenerMesas } from '@/features/mesas/mesas.api';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Armchair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useComandaStore } from '@/store/comandaStore';

export const MesasPage = () => {
    const navigate = useNavigate();
    const seleccionarMesa = useComandaStore((state) => state.seleccionarMesa);

    const [pedidoParaPagar, setPedidoParaPagar] = useState<any>(null);
    const [modalAbierto, setModalAbierto] = useState(false);

    const { data: mesas, isLoading, isError } = useQuery({
        queryKey: ['mesas'],
        queryFn: obtenerMesas,
    });

    if (isLoading) return <div className="text-center p-10">Cargando mesas...</div>;
    if (isError) return <div className="text-center text-red-500 p-10">Error al cargar mesas. Revisa que el backend esté prendido.</div>;

    const handleMesaClick = async (mesa: any) => {
        if (mesa.ocupada) {
            try {
                toast.info('Cargando cuenta...');
                const pedido = await obtenerPedidoActivo(mesa.id);

                if (!pedido) {
                    toast.error('Error: La mesa figura ocupada pero no encontré el pedido.');
                    return;
                }

                pedido.mesa = mesa;
                setPedidoParaPagar(pedido);
                setModalAbierto(true);
            } catch (error) {
                toast.error('Error al cargar datos de cobro');
            }
        } else {
            seleccionarMesa(mesa.id);
            navigate('/tomar-pedido');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Salón Principal</h2>
                <div className="flex gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Libre</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Ocupada</span>
                </div>
            </div>

            {/* GRILLA DE MESAS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mesas?.map((mesa) => (
                    <Card
                        key={mesa.id}
                        onClick={() => handleMesaClick(mesa)}
                        className={`
              cursor-pointer transition-all hover:scale-105 border-2
              ${mesa.ocupada
                                ? 'bg-rose-50 border-rose-200 hover:border-rose-400'
                                : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
                            }
            `}
                    >
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
                            {/* Icono condicional */}
                            {mesa.ocupada
                                ? <Users className="h-8 w-8 text-rose-500" />
                                : <Armchair className="h-8 w-8 text-emerald-600" />
                            }

                            <span className={`text-2xl font-bold ${mesa.ocupada ? 'text-rose-700' : 'text-emerald-700'}`}>
                                {mesa.numero}
                            </span>

                            <span className="text-xs text-slate-500">
                                Capacidad: {mesa.capacidad}
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {pedidoParaPagar && (
                <PagarModal
                    isOpen={modalAbierto}
                    onClose={() => setModalAbierto(false)}
                    pedido={pedidoParaPagar}
                />
            )}
        </div>
    );
};