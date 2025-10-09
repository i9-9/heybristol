# Implementación de Thumbnails con Hover en Grillas

## Resumen

Se ha implementado un nuevo sistema para las grillas de videos que mejora la experiencia de usuario:

1. **Estado inicial**: Las grillas muestran thumbnails estáticos de los videos principales
2. **Al hacer hover**: Se reproduce automáticamente el loop/preview definido en Contentful (campo `thumbnailId`)
3. **Al hacer clic**: Se navega a la página individual donde se reproduce el video completo

## Archivos Creados

### `/src/components/VideoCardWithHover.tsx`

Nuevo componente que maneja el comportamiento de hover en las grillas:

- Muestra thumbnail estático por defecto usando `https://vumbnail.com/${video.id}.jpg`
- Al hacer hover, carga y reproduce el iframe del `thumbnailId` de Contentful
- Transiciones suaves entre estados
- Optimizado para mobile y desktop

**Características técnicas:**
- Delay de 300ms antes de cargar el preview en hover
- Limpieza automática de recursos al salir del hover
- Manejo de casos donde no existe `thumbnailId`
- Overlay con información del video (cliente y título)

## Archivos Modificados

### `/src/app/directors/[slug]/DirectorClient.tsx`

- Reemplazado `VideoCard` por `VideoCardWithHover`
- Las grillas de videos ahora usan el nuevo comportamiento de hover

### `/src/app/gridtest/GridTestClient.tsx`

- Agregado componente interno `VideoGridCard` con la misma funcionalidad
- Maneja el comportamiento de hover para la página de testing de grillas

## Estructura de Datos

Los videos en Contentful deben tener:

```typescript
interface DirectorVideo {
  id: string;
  title: string;
  client: string;
  vimeoId: string;        // Video principal (se reproduce en página individual)
  thumbnailId?: string;   // Video loop/preview (se reproduce en hover)
  order: number;
}
```

## Flujo de Experiencia

### En las Grillas
1. Usuario ve thumbnails estáticos
2. Usuario hace hover sobre un video
3. Después de 300ms, se carga el iframe del `thumbnailId`
4. Se reproduce automáticamente el loop en mute
5. Al salir del hover, vuelve al thumbnail estático

### En Páginas Individuales
1. Usuario hace clic en un video de la grilla
2. Navega a `/directors/[slug]/[videoSlug]`
3. Se reproduce el video completo (`vimeoId`) con controles
4. Puede navegar entre videos con flechas

## Optimizaciones

- Los thumbnails estáticos cargan más rápido que los iframes
- El preview solo se carga cuando hay hover (lazy loading)
- Transiciones suaves con CSS
- Priority en las primeras 3 imágenes para mejor LCP
- Limpieza de timeouts para evitar memory leaks

## Compatibilidad

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS Safari, Chrome Mobile)
- ✅ Tablets
- ✅ Accesibilidad: Overlay visible en mobile, solo en hover en desktop

## Testing

Para probar la funcionalidad:

1. Ir a la página de un director: `/directors/[slug]`
2. Observar que las grillas muestran thumbnails estáticos
3. Hacer hover sobre un video (desktop)
4. Verificar que se reproduce el loop/preview
5. Hacer clic para ver el video completo

## Notas Técnicas

- Si un video no tiene `thumbnailId`, solo muestra el thumbnail estático
- Los iframes tienen `pointer-events: none` para evitar interacción
- El overlay de texto se mantiene visible en mobile para mejor UX
- Las transiciones son de 300ms para el hover y 500ms para la opacidad del iframe

## Beneficios

✅ Mejor experiencia de usuario
✅ Reduce ancho de banda (thumbnails vs videos)
✅ Permite preview rápido del contenido
✅ Mantiene la página individual para ver el video completo
✅ Performance optimizado con lazy loading

