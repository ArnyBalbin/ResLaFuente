import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { useProductos } from '../hooks/useProductos';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import type { Producto, TipoArticulo } from '@/types';

const productoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  precio: z.string().min(1, 'Precio requerido').refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Debe ser numérico'),
  categoriaId: z.string().min(1, 'Debes seleccionar una categoría'),
  orden: z.string().optional(),
  stock: z.string().optional(),
  costo: z.string().optional(),
});

type ProductoFormValues = z.infer<typeof productoSchema>;

interface Props {
  productToEdit?: Producto | null;
  tipoActual: TipoArticulo;
  onSuccess: () => void;
}

export function ProductoForm({ productToEdit, tipoActual, onSuccess }: Props) {
  const { crearProducto, actualizarProducto } = useProductos();
  const { categorias } = useCategorias();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(productToEdit?.imagenUrl || null);
  
  // NUEVO: Estado para controlar si es un componente de precio 0
  const [esAcompanamiento, setEsAcompanamiento] = useState(
    productToEdit ? Number(productToEdit.precio) === 0 : false
  );

  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema) as Resolver<ProductoFormValues>,
    defaultValues: {
      nombre: productToEdit?.nombre || '',
      precio: productToEdit?.precio.toString() || '',
      categoriaId: productToEdit?.categoriaId.toString() || '',
      orden: productToEdit?.orden?.toString() || '0',
      stock: productToEdit?.stock.toString() || '0',
      costo: productToEdit?.costo.toString() || '0',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProductoFormValues) => {
    try {
      const isProducto = tipoActual === 'PRODUCTO';
      
      // NUEVO: Aseguramos que el precio sea exactamente 0 si el switch está activo
      const precioFinal = esAcompanamiento ? 0 : parseFloat(data.precio);

      const payload = {
        nombre: data.nombre,
        tipo: tipoActual,
        precio: precioFinal,
        categoriaId: parseInt(data.categoriaId),
        orden: parseInt(data.orden || '0'),
        controlarStock: isProducto,
        stock: isProducto ? parseInt(data.stock || '0') : 0,
        costo: isProducto ? parseFloat(data.costo || '0') : 0,
      };

      if (productToEdit) {
        await actualizarProducto({ id: productToEdit.id, data: payload, file: selectedFile || undefined });
      } else {
        await crearProducto({ data: payload, file: selectedFile || undefined });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* ZONA DE IMAGEN */}
        <div className="md:col-span-3 space-y-4">
          <Label className="text-slate-600 font-semibold">Fotografía</Label>
          <div className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center aspect-square relative overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Reemplazar foto</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-slate-400 p-4 text-center">
                <ImageIcon className="h-12 w-12 mb-3 opacity-60 text-slate-300" />
                <span className="text-sm font-medium">Subir Imagen</span>
                <span className="text-xs mt-1">PNG o JPG (Max 2MB)</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* ZONA DE DATOS */}
        <div className="md:col-span-9 flex flex-col justify-between">
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="col-span-2 md:col-span-1 space-y-2">
              <Label className="text-slate-600">Nombre del {tipoActual === 'PLATO' ? 'Plato' : 'Producto'}</Label>
              <Input className="h-11 bg-slate-50" placeholder="Ej. Papa a la Huancaina..." {...form.register('nombre')} />
              {form.formState.errors.nombre && <p className="text-xs text-red-500 font-medium">{form.formState.errors.nombre.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-600">Categoría</Label>
              <Controller
                control={form.control}
                name="categoriaId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger className={`h-11 bg-slate-50 ${form.formState.errors.categoriaId ? "border-red-500 ring-red-500" : ""}`}>
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((padre) => (
                        <SelectGroup key={padre.id}>
                          <SelectLabel className="bg-slate-100 text-slate-800 font-bold">{padre.nombre}</SelectLabel>
                          {padre.hijos && padre.hijos.length > 0 ? (
                            padre.hijos.map((hijo) => (
                              <SelectItem key={hijo.id} value={hijo.id.toString()} className="pl-8">{hijo.nombre}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value={padre.id.toString()} className="pl-8 text-slate-500">{padre.nombre} (Principal)</SelectItem>
                          )}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.categoriaId && <p className="text-xs text-red-500 font-medium">{form.formState.errors.categoriaId.message}</p>}
            </div>

            {/* NUEVO: BLOQUE DE PRECIO INTELIGENTE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-slate-600">Precio de Venta (S/)</Label>
                {tipoActual === 'PLATO' && (
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={esAcompanamiento} 
                      onCheckedChange={(val) => {
                        setEsAcompanamiento(val);
                        if (val) form.setValue('precio', '0');
                      }} 
                    />
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Es Acompañamiento</span>
                  </div>
                )}
              </div>
              <Input 
                type="number" 
                step="0.10" 
                disabled={esAcompanamiento}
                className={`h-11 bg-slate-50 font-medium text-blue-700 ${esAcompanamiento ? 'opacity-50 cursor-not-allowed' : ''}`} 
                {...form.register('precio')} 
              />
            </div>

            {/* CAMPOS EXCLUSIVOS PARA PRODUCTOS */}
            {tipoActual === 'PRODUCTO' && (
              <>
                <div className="space-y-2 animate-in fade-in zoom-in-95">
                  <Label className="text-slate-600">Costo Unitario (S/)</Label>
                  <Input type="number" step="0.10" className="h-11 bg-slate-50" {...form.register('costo')} />
                </div>
                <div className="space-y-2 animate-in fade-in zoom-in-95">
                  <Label className="text-slate-600">Stock Inicial (Unidades)</Label>
                  <Input type="number" className="h-11 bg-slate-50" {...form.register('stock')} />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="text-slate-600">Prioridad / Orden en menú</Label>
              <Input type="number" className="h-11 bg-slate-50" placeholder="0" {...form.register('orden')} />
              <p className="text-[11px] text-slate-400 mt-1">Números menores aparecen primero (Ej: 1, 2, 3).</p>
            </div>
          </div>

          <div className="flex justify-end border-t pt-6 mt-8">
            <Button type="button" variant="ghost" className="mr-3 text-slate-500" onClick={onSuccess}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting} className="h-11 px-8 bg-blue-700 hover:bg-blue-800 shadow-md">
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {productToEdit ? 'Guardar Cambios' : 'Registrar'}
            </Button>
          </div>

        </div>
      </div>
    </form>
  );
}