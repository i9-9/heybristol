# Configuración de Contentful - Campo Order

Este documento explica cómo configurar el campo `order` en Contentful para controlar el orden de los directores y videos.

## Variables de Entorno Requeridas

Crea un archivo `.env.local` con las siguientes variables:

```env
# Contentful Configuration
CONTENTFUL_SPACE_ID=your_space_id_here
CONTENTFUL_ACCESS_TOKEN=your_access_token_here
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token_here

# Next.js Configuration
NEXT_PUBLIC_USE_CONTENTFUL=true
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your_space_id_here
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=your_access_token_here
```

## Proceso de Configuración

### 1. Agregar Campo Order a Contentful

Ejecuta el script para agregar el campo `order` a todos los content types:

```bash
npm run add-order-field
```

Este script:
- Agrega el campo `order` (Integer) a los content types: `director`, `directorVideo`, `heroVideo`, `editorialVideo`
- Hace el campo opcional para no romper entradas existentes
- Publica los content types actualizados

### 2. Asignar Valores de Orden en Contentful

Ve a tu espacio de Contentful y asigna valores de orden:

1. **Directores**: Asigna números del 1 al N para controlar el orden de aparición
2. **Videos de Director**: Asigna números del 1 al N para controlar el orden dentro de cada director
3. **Hero Videos**: Asigna números del 1 al N para controlar el orden de rotación
4. **Editorial Videos**: Asigna números del 1 al N para controlar el orden de aparición

### 3. Actualizar Consultas de Contentful

Una vez que hayas asignado los valores de orden, ejecuta:

```bash
npm run update-contentful-queries
```

Este script:
- Actualiza las consultas para usar `order: ['fields.order']`
- Hace el campo `order` requerido en los tipos TypeScript
- Remueve los fallbacks de orden

### 4. Desplegar

Después de completar los pasos anteriores, despliega tu aplicación:

```bash
npm run build
npm run start
```

## Beneficios del Campo Order

- **Control preciso**: Puedes controlar exactamente el orden de directores y videos
- **Flexibilidad**: Puedes reordenar elementos sin cambiar el orden de creación
- **Consistencia**: El orden será consistente entre desarrollo y producción
- **Mantenibilidad**: Es más fácil gestionar el orden desde Contentful

## Troubleshooting

### Error: "No field with id 'order' found"

Si ves este error, significa que el campo `order` no existe en Contentful. Ejecuta:

```bash
npm run add-order-field
```

### Error: "Field 'order' is required"

Si ves este error después de actualizar las consultas, significa que hay entradas sin valor de orden. Ve a Contentful y asigna valores a todas las entradas.

### Fallback a Datos Locales

Si Contentful falla, la aplicación automáticamente usará los datos locales definidos en `src/data/directors.ts`.
