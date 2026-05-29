# Archivos POS — Instrucciones de instalación

## Estructura de archivos a crear/editar

```
src/
├── features/
│   └── pos/                          ← CARPETA NUEVA
│       ├── types/
│       │   └── pos.types.ts          ← NUEVO
│       ├── services/
│       │   └── pos.service.ts        ← NUEVO
│       ├── hooks/
│       │   └── usePos.ts             ← NUEVO
│       └── components/
│           ├── MesaCard.tsx          ← NUEVO
│           ├── CatalogoProductos.tsx ← NUEVO
│           ├── CarritoPedido.tsx     ← NUEVO
│           └── PosView.tsx           ← NUEVO
├── pages/
│   └── pos/
│       └── PosPage.tsx               ← NUEVO
└── App.tsx                           ← EDITAR (agregar import + ruta)
```

## Pasos

1. Crea la carpeta `src/features/pos/` con las subcarpetas
2. Copia cada archivo en su ruta correspondiente
3. En `App.tsx`, reemplaza:
   ```tsx
   const PosPage = () => <div><h1>Punto de Venta (POS)</h1></div>;
   ```
   por:
   ```tsx
   import PosPage from './pages/pos/PosPage';
   ```

## Endpoints que usa el POS

Asegúrate de que tu API tenga estos endpoints:
- `GET  /mesas`               → lista de mesas con pedido activo
- `GET  /categorias`          → categorías (para filtrar)
- `GET  /productos`           → productos (acepta ?categoriaId=X)
- `POST /pedidos`             → crear pedido
- `GET  /caja/activa`         → caja del turno actual

## Notas importantes

- El POS refresca las mesas cada 15 segundos automáticamente
- Es responsivo: en móvil hay tabs para alternar entre Mesas y Catálogo
- Solo crea pedidos tipo MESA; para LLEVAR/DELIVERY se puede extender
- El botón "Enviar a Cocina" requiere que haya mesa seleccionada Y items en el carrito
