import { useState, useEffect } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, // <--- Nuevo
  SelectLabel } from '@/components/ui/select';
import { useProductos } from '../hooks/useProductos';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import type { Producto } from '@/types';

const productoSchema = z.object({
  nombre: z.string().min(3, 'Nombre requerido'),
  descripcion: z.string().optional(),
  precio: z.string().min(1, 'Precio requerido').refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Debe ser mayor a 0'),
  categoriaId: z.string().min(1, 'Selecciona una categoría'),
  orden: z.string().optional(),
  
  controlarStock: z.boolean().default(false),
  stock: z.string().optional(),
  costo: z.string().optional(),
});

type ProductoFormValues = z.infer<typeof productoSchema>;

interface Props {
  productToEdit?: Producto | null;
  onSuccess: () => void;
}

export function ProductoForm({ productToEdit, onSuccess }: Props) {
  const { crearProducto, actualizarProducto } = useProductos();
  const { categorias } = useCategorias();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(productToEdit?.imagenUrl || null);

  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema) as Resolver<ProductoFormValues>,
    defaultValues: {
      nombre: productToEdit?.nombre || '',
      descripcion: productToEdit?.descripcion || '',
      precio: productToEdit?.precio.toString() || '',
      categoriaId: productToEdit?.categoriaId.toString() || '',
      orden: productToEdit?.orden?.toString() || '0',
      controlarStock: productToEdit?.controlarStock || false,
      stock: productToEdit?.stock.toString() || '0',
      costo: productToEdit?.costo.toString() || '0',
    },
  });

  const controlarStock = form.watch('controlarStock');

  // Manejo de la imagen visual
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const onSubmit = async (data: ProductoFormValues) => {
    try {
      const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: parseFloat(data.precio),
        categoriaId: parseInt(data.categoriaId),
        orden: parseInt(data.orden || '0'),
        controlarStock: data.controlarStock,
        stock: data.controlarStock ? parseInt(data.stock || '0') : 0,
        costo: data.controlarStock ? parseFloat(data.costo || '0') : 0,
        // disponibleHoy: true (por defecto al crear)
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

  // Filtramos solo categorías HIJAS (las que tienen padreId !== null) o todas si prefieres
  // En tu lógica dijiste que solo hijos tienen productos.
  const categoriasHijas = categorias.filter(c => c.padreId !== null);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: IMAGEN (4 cols) */}
        <div className="md:col-span-4 space-y-3">
          <Label>Imagen del Plato</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl flex flex-col items-center justify-center aspect-square relative overflow-hidden bg-muted/10 group hover:bg-muted/20 transition-colors">
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium">Cambiar imagen</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-muted-foreground p-4 text-center">
                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                <span className="text-xs">Subir foto (JPG/PNG)</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </div>
          {productToEdit && !selectedFile && (
             <p className="text-[10px] text-muted-foreground text-center">
               Deja vacío para mantener la actual
             </p>
          )}
        </div>

        {/* COLUMNA DERECHA: DATOS (8 cols) */}
        <div className="md:col-span-8 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nombre del Producto</Label>
              <Input placeholder="Ej. Lomo Saltado Especial" {...form.register('nombre')} />
              {form.formState.errors.nombre && <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>}
            </div>
            
            <div className="col-span-2">
              <Label>Descripción Corta</Label>
              <Textarea placeholder="Ingredientes o detalles..." className="h-20 resize-none" {...form.register('descripcion')} />
            </div>

            <div>
              <Label>Precio Venta (S/)</Label>
              <Input type="number" step="0.10" {...form.register('precio')} />
            </div>

            <div>
              <Label>Categoría</Label>
              <Controller
                control={form.control}
                name="categoriaId"
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    // Si el valor es "", le pasamos undefined para que Shadcn no se congele
                    value={field.value || undefined} 
                  >
                    <SelectTrigger className={form.formState.errors.categoriaId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecciona una categoría..." />
                    </SelectTrigger>
                    
                    <SelectContent>
                      {categorias.length === 0 && (
                        <div className="p-4 text-xs text-muted-foreground text-center">
                          No hay categorías creadas
                        </div>
                      )}
                      
                      {/* Agrupamos por Categoría Padre */}
                      {categorias.map((padre) => (
                        <SelectGroup key={padre.id}>
                          <SelectLabel className="bg-muted/30 text-primary font-bold">
                            {padre.nombre}
                          </SelectLabel>
                          
                          {/* Si tiene subcategorías, las listamos */}
                          {padre.hijos && padre.hijos.length > 0 ? (
                            padre.hijos.map((hijo) => (
                              <SelectItem key={hijo.id} value={hijo.id.toString()} className="pl-8 cursor-pointer">
                                {hijo.nombre}
                              </SelectItem>
                            ))
                          ) : (
                            /* Si el padre NO tiene hijos, permitimos seleccionar al padre mismo */
                            <SelectItem value={padre.id.toString()} className="pl-8 cursor-pointer text-muted-foreground">
                              {padre.nombre} (Sin subcategorías)
                            </SelectItem>
                          )}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.categoriaId && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.categoriaId.message}</p>
              )}
            </div>
          </div>

          {/* SECCIÓN LOGÍSTICA */}
          <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="control-stock" className="cursor-pointer flex flex-col">
                <span>Controlar Stock</span>
                <span className="text-[10px] font-normal text-muted-foreground">Activa si es un producto contado (ej. Gaseosas)</span>
              </Label>
              <Switch 
                id="control-stock" 
                checked={controlarStock}
                onCheckedChange={(val) => form.setValue('controlarStock', val)}
              />
            </div>

            {controlarStock && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <Label>Stock Actual</Label>
                  <Input type="number" {...form.register('stock')} />
                </div>
                <div>
                  <Label>Costo Unitario (Ref.)</Label>
                  <Input type="number" step="0.10" {...form.register('costo')} />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-2">
             <div className="w-24">
               <Label>Orden</Label>
               <Input type="number" {...form.register('orden')} className="h-8 text-xs" />
             </div>
             <Button type="submit" disabled={form.formState.isSubmitting}>
               {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
               {productToEdit ? 'Actualizar Plato' : 'Guardar Plato'}
             </Button>
          </div>

        </div>
      </div>
    </form>
  );
}