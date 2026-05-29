import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCrearCliente, useActualizarCliente } from '../hooks/useClientes';
import type { Cliente, CrearClienteDto } from '../types/clientes.types';
import type { EmpresaSimple } from '@/features/pos/types/pos.types';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';

interface ClienteModalProps {
  cliente?: Cliente | null;
  onClose: () => void;
}

export function ClienteModal({ cliente, onClose }: ClienteModalProps) {
  const esEdicion = !!cliente;
  const [form, setForm] = useState<CrearClienteDto>({
    nombre: '', dni: '', ruc: '', email: '', telefono: '', direccion: '',
    convenioEmpresaId: undefined,
    convenioLimiteDiario: undefined,
  });

  const { data: empresas = [] } = useQuery<EmpresaSimple[]>({
    queryKey: ['empresas'],
    queryFn: async () => { const { data } = await api.get('/empresas'); return data; },
  });

  const { mutateAsync: crear, isPending: creando } = useCrearCliente();
  const { mutateAsync: actualizar, isPending: actualizando } = useActualizarCliente();
  const isLoading = creando || actualizando;

  useEffect(() => {
    if (cliente) {
      setForm({
        nombre: cliente.nombre,
        dni: cliente.dni || '',
        ruc: cliente.ruc || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        // ✅ leer del primer convenio
        convenioEmpresaId: cliente.convenios[0]?.empresaId || undefined,
        convenioLimiteDiario: cliente.convenios[0] ? Number(cliente.convenios[0].limiteDiario) : undefined,
      });
    }
  }, [cliente]);
  
  const handleSubmit = async () => {
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return; }
    if (form.convenioEmpresaId && !form.convenioLimiteDiario) {
      toast.error('Ingresa el límite diario del convenio'); return;
    }
    try {
      const payload = { ...form };
      if (!payload.convenioEmpresaId) {
        delete payload.convenioEmpresaId;
        delete payload.convenioLimiteDiario;
      }
      if (esEdicion) {
        await actualizar({ id: cliente!.id, dto: payload });
        toast.success('Cliente actualizado');
      } else {
        await crear(payload);
        toast.success('Cliente creado');
      }
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al guardar');
    }
  };

  const set = (k: keyof CrearClienteDto, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6">

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <User size={18} className="text-primary" />
            {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs mb-1 block">Nombre *</Label>
            <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre completo" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">DNI</Label>
              <Input value={form.dni} onChange={e => set('dni', e.target.value)} placeholder="12345678" maxLength={8} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Teléfono</Label>
              <Input value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="999 888 777" />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Email</Label>
            <Input value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.com" type="email" />
          </div>

          <div>
            <Label className="text-xs mb-1 block">Dirección</Label>
            <Input value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Dirección del cliente" />
          </div>

          <div>
            <Label className="text-xs mb-1 block">Empresa vinculada (convenio)</Label>
            <select
              value={form.convenioEmpresaId || ''}
              onChange={e => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                set('convenioEmpresaId', val);
                if (!val) set('convenioLimiteDiario', undefined);
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">— Sin empresa —</option>
              {empresas.map(e => (
                <option key={e.id} value={e.id}>{e.razonSocial}</option>
              ))}
            </select>
          </div>

          {form.convenioEmpresaId && (
            <div>
              <Label className="text-xs mb-1 block">Límite diario del convenio (S/) *</Label>
              <Input
                type="number"
                min={0}
                value={form.convenioLimiteDiario || ''}
                onChange={e => set('convenioLimiteDiario', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ej: 50.00"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Monto máximo que puede consumir este cliente por día en la empresa
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5 justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 size={14} className="animate-spin mr-1" />}
            {esEdicion ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </div>
      </div>
    </div>
  );
}
