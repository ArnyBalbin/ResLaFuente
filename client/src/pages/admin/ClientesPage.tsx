import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerClientes, crearCliente, actualizarCliente, eliminarCliente } from '@/features/clientes/clientes.api';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, MoreHorizontal, Building2, User, Briefcase } from 'lucide-react';

export const ClientesPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '', // Guardará "nombre" o "razonSocial"
    tipoEntidad: 'CLIENTE', // 'CLIENTE' (Tabla Cliente) o 'EMPRESA' (Tabla Empresa)
    tipoDocumento: 'DNI',   // 'DNI' o 'RUC'
    documento: '',          // El número
    direccion: '',
    telefono: '',
    email: ''
  });

  const { data: clientes, isLoading } = useQuery({ queryKey: ['clientes'], queryFn: obtenerClientes });

  const guardarMutation = useMutation({
    mutationFn: (data: any) => {
      if (clienteEditando) return actualizarCliente(clienteEditando.id, data);
      return crearCliente(data);
    },
    onSuccess: () => {
      toast.success(clienteEditando ? 'Registro actualizado' : 'Registro creado');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      cerrarModal();
    },
    onError: (err: any) => toast.error('Error al guardar')
  });

  const eliminarMutation = useMutation({
    mutationFn: ({id, tipo}: {id: number, tipo: string}) => eliminarCliente(id, tipo),
    onSuccess: () => {
      toast.success('Eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
    onError: () => toast.error('No se pudo eliminar')
  });

  const cerrarModal = () => {
    setModalOpen(false);
    setClienteEditando(null);
    setFormData({ nombre: '', tipoEntidad: 'CLIENTE', tipoDocumento: 'DNI', documento: '', direccion: '', telefono: '', email: '' });
  };

  const abrirParaEditar = (cli: any) => {
    setClienteEditando(cli);
    setFormData({
      nombre: cli.nombre,
      tipoEntidad: cli.tipoEntidad,
      tipoDocumento: cli.tipoDocumento,
      documento: cli.documento,
      direccion: cli.direccion || '',
      telefono: cli.telefono || '',
      email: cli.email || ''
    });
    setModalOpen(true);
  };

  // Maneja el cambio de tipo de entidad (Empresa vs Cliente)
  const handleTipoChange = (tipo: string) => {
    if (tipo === 'EMPRESA') {
      setFormData({ ...formData, tipoEntidad: 'EMPRESA', tipoDocumento: 'RUC', documento: '' });
    } else {
      setFormData({ ...formData, tipoEntidad: 'CLIENTE', tipoDocumento: 'DNI', documento: '' });
    }
  };

  if (isLoading) return <div className="p-10 text-center">Cargando directorio...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Clientes & Empresas</h2>
          <p className="text-slate-500">Gestión unificada para facturación.</p>
        </div>
        <Button onClick={() => { cerrarModal(); setModalOpen(true); }} className="gap-2">
          <Plus size={18} /> Nuevo Registro
        </Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Nombre / Razón Social</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes?.map((c: any) => (
              <TableRow key={`${c.tipoEntidad}-${c.id}`}>
                <TableCell>
                  <div className={`p-2 rounded-full w-fit 
                    ${c.tipoEntidad === 'EMPRESA' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {c.tipoEntidad === 'EMPRESA' ? <Building2 size={16}/> : <User size={16}/>}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {c.nombre}
                  <div className="text-xs text-slate-400">
                    {c.tipoEntidad === 'EMPRESA' ? 'Persona Jurídica' : 'Persona Natural'}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm bg-slate-50 px-2 py-1 rounded border">
                    {c.tipoDocumento}: {c.documento}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  <div>{c.telefono || '-'}</div>
                  <div className="text-xs truncate max-w-[150px]">{c.direccion}</div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => abrirParaEditar(c)}>
                        <Pencil className="mr-2 h-4 w-4"/> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => { if(confirm('¿Eliminar registro?')) eliminarMutation.mutate({id: c.id, tipo: c.tipoEntidad}) }} 
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4"/> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{clienteEditando ? 'Editar Registro' : 'Nuevo Registro'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            {/* SELECTOR DE TIPO PRINCIPAL */}
            <div className="space-y-2">
              <Label>¿Qué vas a registrar?</Label>
              <div className="flex gap-4">
                <Button 
                  type="button"
                  variant={formData.tipoEntidad === 'CLIENTE' ? 'default' : 'outline'}
                  onClick={() => handleTipoChange('CLIENTE')}
                  className="flex-1 gap-2"
                >
                  <User size={16} /> Persona
                </Button>
                <Button 
                  type="button"
                  variant={formData.tipoEntidad === 'EMPRESA' ? 'default' : 'outline'}
                  onClick={() => handleTipoChange('EMPRESA')}
                  className="flex-1 gap-2"
                >
                  <Building2 size={16} /> Empresa
                </Button>
              </div>
            </div>

            {/* CAMPOS DINÁMICOS */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-2">
                <Label>Doc.</Label>
                <Select 
                  value={formData.tipoDocumento} 
                  onValueChange={(v) => setFormData({...formData, tipoDocumento: v})}
                  disabled={formData.tipoEntidad === 'EMPRESA'} // Empresas solo tienen RUC
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="RUC">RUC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Número</Label>
                <Input 
                  value={formData.documento} 
                  onChange={(e) => setFormData({...formData, documento: e.target.value})} 
                  placeholder={formData.tipoDocumento === 'RUC' ? '20...' : 'Documento'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{formData.tipoEntidad === 'EMPRESA' ? 'Razón Social' : 'Nombre Completo'}</Label>
              <Input 
                value={formData.nombre} 
                onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input 
                value={formData.direccion} 
                onChange={(e) => setFormData({...formData, direccion: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input 
                  value={formData.telefono} 
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
                />
              </div>
              
              {/* Email solo para personas (según tu schema Empresa no tiene email) */}
              {formData.tipoEntidad === 'CLIENTE' && (
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              )}
            </div>

            <Button onClick={() => guardarMutation.mutate(formData)} className="w-full mt-4 bg-blue-600">
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};