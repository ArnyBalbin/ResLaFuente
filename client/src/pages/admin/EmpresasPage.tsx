import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerEmpresas, crearEmpresa, actualizarEmpresa, eliminarEmpresa } from '@/features/empresas/empresas.api';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, MoreHorizontal, Building2, CreditCard, AlertCircle } from 'lucide-react';

export const EmpresasPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<any>(null);

  const [formData, setFormData] = useState({
    razonSocial: '',
    ruc: '',
    direccion: '',
    telefono: '',
    tieneCredito: false,
    limiteCredito: 0,
    diaCierre: 30
  });

  const { data: empresas, isLoading } = useQuery({ queryKey: ['empresas'], queryFn: obtenerEmpresas });

  const guardarMutation = useMutation({
    mutationFn: (data: any) => {
      // Asegurar números correctos antes de enviar
      const payload = {
        ...data,
        limiteCredito: Number(data.limiteCredito),
        diaCierre: Number(data.diaCierre)
      };
      if (empresaEditando) return actualizarEmpresa(empresaEditando.id, payload);
      return crearEmpresa(payload);
    },
    onSuccess: () => {
      toast.success(empresaEditando ? 'Empresa actualizada' : 'Empresa registrada');
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      cerrarModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al guardar')
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarEmpresa,
    onSuccess: () => {
      toast.success('Empresa eliminada');
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'No se puede eliminar (tiene deudas o empleados)')
  });

  const cerrarModal = () => {
    setModalOpen(false);
    setEmpresaEditando(null);
    setFormData({ razonSocial: '', ruc: '', direccion: '', telefono: '', tieneCredito: false, limiteCredito: 0, diaCierre: 30 });
  };

  const abrirParaEditar = (emp: any) => {
    setEmpresaEditando(emp);
    setFormData({
      razonSocial: emp.razonSocial,
      ruc: emp.ruc,
      direccion: emp.direccion || '',
      telefono: emp.telefono || '',
      tieneCredito: emp.tieneCredito,
      limiteCredito: Number(emp.limiteCredito),
      diaCierre: emp.diaCierre
    });
    setModalOpen(true);
  };

  if (isLoading) return <div className="p-10 text-center">Cargando empresas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Empresas Corporativas</h2>
          <p className="text-slate-500">Gestión de Líneas de Crédito y Facturación Mensual.</p>
        </div>
        <Button onClick={() => { cerrarModal(); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus size={18} /> Nueva Empresa
        </Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>RUC</TableHead>
              <TableHead>Estado de Crédito</TableHead>
              <TableHead>Empleados</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresas?.map((emp: any) => {
              // Calcular porcentaje de uso
              const uso = emp.limiteCredito > 0 ? (emp.creditoUsado / emp.limiteCredito) * 100 : 0;
              const colorBarra = uso > 90 ? 'bg-red-500' : uso > 75 ? 'bg-orange-500' : 'bg-green-500';

              return (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="font-bold">{emp.razonSocial}</div>
                        <div className="text-xs text-slate-500">{emp.direccion}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{emp.ruc}</TableCell>
                  <TableCell className="w-[300px]">
                    {emp.tieneCredito ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>S/ {Number(emp.creditoUsado).toFixed(2)} usado</span>
                          <span className="text-slate-500">Límite: S/ {Number(emp.limiteCredito).toFixed(2)}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${colorBarra}`} style={{ width: `${Math.min(uso, 100)}%` }}></div>
                        </div>
                        {uso >= 100 && (
                          <div className="flex items-center gap-1 text-xs text-red-600 font-bold">
                            <AlertCircle size={12}/> Crédito Agotado
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Pago al Contado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                      {emp._count?.empleados || 0} vinculados
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreHorizontal size={16}/></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => abrirParaEditar(emp)}><Pencil className="mr-2 h-4 w-4"/> Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirm('¿Eliminar empresa?') && eliminarMutation.mutate(emp.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* MODAL CREAR/EDITAR EMPRESA */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{empresaEditando ? 'Editar Empresa' : 'Registrar Empresa Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-2">
                <Label>RUC</Label>
                <Input value={formData.ruc} onChange={e => setFormData({...formData, ruc: e.target.value})} placeholder="20..." />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Razón Social</Label>
                <Input value={formData.razonSocial} onChange={e => setFormData({...formData, razonSocial: e.target.value})} placeholder="Ej: MINERA SAC" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
              </div>
            </div>

            {/* SECCIÓN DE CRÉDITO */}
            <div className="border p-4 rounded-md bg-slate-50 space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Línea de Crédito</Label>
                  <p className="text-xs text-slate-500">¿Esta empresa puede consumir y pagar a fin de mes?</p>
                </div>
                <Switch 
                  checked={formData.tieneCredito}
                  onCheckedChange={(checked) => setFormData({...formData, tieneCredito: checked})}
                />
              </div>

              {formData.tieneCredito && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><CreditCard size={14}/> Límite (S/)</Label>
                    <Input type="number" value={formData.limiteCredito} onChange={e => setFormData({...formData, limiteCredito: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Día de Corte</Label>
                    <Input type="number" max={31} min={1} value={formData.diaCierre} onChange={e => setFormData({...formData, diaCierre: Number(e.target.value)})} />
                  </div>
                </div>
              )}
            </div>

            <Button onClick={() => guardarMutation.mutate(formData)} disabled={guardarMutation.isPending} className="w-full mt-2 bg-blue-600">
              {guardarMutation.isPending ? 'Guardando...' : 'Guardar Empresa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};