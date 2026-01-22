import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategorias } from '../hooks/useCategorias';
import type { Categoria } from '@/types';
import { Loader2, Save } from 'lucide-react';

const categoriaSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  padreId: z.string().optional(), // El select devuelve string, luego convertimos a number
});

type CategoriaFormValues = z.infer<typeof categoriaSchema>;

interface Props {
  categoriaToEdit?: Categoria | null;
  onSuccess: () => void;
  padrePreseleccionado?: number | null; // Nuevo prop por si creamos una subcategoría directamente
}

export function CategoriaForm({ categoriaToEdit, onSuccess, padrePreseleccionado }: Props) {
  const { crearCategoria,   actualizarCategoria, categorias } = useCategorias();

  // Filtramos solo las categorías que pueden ser padres (las que no tienen padreId)
  // Y evitamos que una categoría sea su propio padre si estamos editando
  const posiblesPadres = categorias.filter(c => c.padreId === null && c.id !== categoriaToEdit?.id);

  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nombre: categoriaToEdit?.nombre || '',
      // Convertimos a string para el Select, o undefined si es null
      padreId: categoriaToEdit?.padreId?.toString() || padrePreseleccionado?.toString() || undefined,
    },
  });

  const onSubmit = async (data: CategoriaFormValues) => {
    try {
      const payload = {
        nombre: data.nombre,
        // Convertimos "undefined" o string vacío a undefined, o número si hay valor
        padreId: data.padreId ? parseInt(data.padreId) : undefined,
      };

      if (categoriaToEdit) {
        await actualizarCategoria({ id: categoriaToEdit.id, data: payload });
      } else {
        await crearCategoria(payload);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
      
      <div className="space-y-2">
        <Label>Nombre de Categoría</Label>
        <Input placeholder="Ej. Bebidas, Entradas..." {...form.register('nombre')} />
        {form.formState.errors.nombre && (
          <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Categoría Padre (Opcional)</Label>
        <Select
          value={form.watch('padreId')}
          onValueChange={(val) => form.setValue('padreId', val === 'none' ? undefined : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Es una categoría principal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Sin Padre (Principal) --</SelectItem>
            {posiblesPadres.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">
          Selecciona una categoría principal si esta es una subcategoría (ej. Cervezas pertenece a Bebidas).
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {categoriaToEdit ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}