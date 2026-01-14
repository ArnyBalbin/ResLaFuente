import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerClientes, crearCliente, actualizarCliente, eliminarCliente } from '@/features/clientes/clientes.api';
import { obtenerEmpresas } from '@/features/empresas/empresas.api'; // Importamos esto para el Select
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, MoreHorizontal, User, Building2, Briefcase } from 'lucide-react';

export const ClientesPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<any>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    email: '',
    empresaId: '0' // '0' significa "Sin Empresa" (Cliente Particular)
  });

  // 1. CARGAMOS CLIENTES Y EMPRESAS
  const { data: clientes, isLoading } = useQuery({ queryKey: ['clientes'], queryFn: obtenerClientes });
  const { data: empresas } = useQuery({ queryKey: ['empresas'], queryFn: obtenerEmpresas });

  const guardarMutation = useMutation({
    mutationFn: (data: any) => {
      // Preparamos el payload
      const payload = {
        nombre: data.nombre,
        dni: data.dni,
        email: data.email,
        // Si empresaId es '0' o vacío, mandamos undefined, si no, el número
        empresaId: (data.empresaId && data.empresaId !== '0') ? Number(data.empresaId) : undefined
      };

      if (clienteEditando) return actualizarCliente(clienteEditando.id, payload);
      return crearCliente(payload);
    },
    onSuccess: () => {
      toast.success(clienteEditando ? 'Cliente actualizado' : 'Cliente registrado');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      cerrarModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al guardar')
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarCliente(id, 'cliente'),
    onSuccess: () => {
      toast.success('Cliente eliminado');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
    onError: () => toast.error('Error al eliminar')
  });

  const cerrarModal = () => {
    setModalOpen(false);
    setClienteEditando(null);
    setFormData({ nombre: '', dni: '', email: '', empresaId: '0' });
  };

  const abrirParaEditar = (c: any) => {
    setClienteEditando(c);
    setFormData({
      nombre: c.nombre,
      dni: c.dni || '',
      email: c.email || '',
      empresaId: c.empresaId ? c.empresaId.toString() : '0'
    });
    setModalOpen(true);
  };

  if (isLoading) return <div className="p-10 text-center">Cargando directorio...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Personas y Empleados</h2>
          <p className="text-slate-500">Administra quién consume en el restaurante.</p>
        </div>
        <Button onClick={() => { cerrarModal(); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus size={18} /> Nuevo Cliente
        </Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Empresa Vinculada</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes?.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="bg-slate-100 p-2 rounded-full w-fit text-slate-500">
                    <User size={16}/>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {c.nombre}
                  <div className="text-xs text-slate-400">{c.email}</div>
                </TableCell>
                <TableCell>
                  {c.dni ? (
                    <span className="font-mono text-sm bg-slate-50 px-2 py-1 rounded border">DNI: {c.dni}</span>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {c.empresa ? (
                    <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-1 rounded-full w-fit border border-blue-100">
                      <Briefcase size={14} />
                      <span className="text-xs font-bold">{c.empresa.razonSocial}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Particular</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal size={16}/></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => abrirParaEditar(c)}><Pencil className="mr-2 h-4 w-4"/> Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => confirm('¿Borrar cliente?') && eliminarMutation.mutate(c.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{clienteEditando ? 'Editar Persona' : 'Registrar Persona'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: Juan Pérez" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DNI (Opcional)</Label>
                <Input value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} placeholder="12345678" />
              </div>
              <div className="space-y-2">
                <Label>Email (Opcional)</Label>
                <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="juan@correo.com" />
              </div>
            </div>

            {/* SELECCIÓN DE EMPRESA */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="flex items-center gap-2">
                <Building2 size={16} className="text-slate-500"/> 
                ¿Trabaja en alguna empresa con crédito?
              </Label>
              <Select 
                value={formData.empresaId} 
                onValueChange={(v) => setFormData({...formData, empresaId: v})}
              >
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Seleccione empresa..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">-- Ninguna (Cliente Particular) --</SelectItem>
                  {empresas?.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.razonSocial} {emp.tieneCredito && '💳'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Si seleccionas una empresa, este cliente podrá cargar sus consumos a la cuenta corporativa.
              </p>
            </div>

            <Button onClick={() => guardarMutation.mutate(formData)} className="w-full mt-4 bg-blue-600">
              Guardar Registro
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};