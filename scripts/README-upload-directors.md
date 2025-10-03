# Upload Directors from DOCX Script

Este script permite subir información de directores desde un archivo .docx a Contentful.

## Requisitos Previos

1. **Archivo .docx**: Debe estar en el directorio raíz del proyecto con el nombre `Direectores reels info.docx`
2. **Variables de entorno**: Asegúrate de tener configuradas las siguientes variables:
   - `CONTENTFUL_SPACE_ID` o `NEXT_PUBLIC_CONTENTFUL_SPACE_ID`
   - `CONTENTFUL_MANAGEMENT_TOKEN` (token de gestión de Contentful)
   - `CONTENTFUL_ENVIRONMENT_ID` (opcional, por defecto usa 'master')

## Cómo Usar

1. **Preparar el archivo .docx**:
   - Coloca el archivo `Direectores reels info.docx` en el directorio raíz del proyecto
   - El archivo debe contener información de directores y sus videos

2. **Ejecutar el script**:
   ```bash
   npm run upload-directors-docx
   ```

3. **Seguir las instrucciones**:
   - El script mostrará los datos parseados
   - Te pedirá confirmación antes de subir
   - Revisa los datos antes de confirmar

## Formato Esperado del DOCX

El script espera que el archivo .docx tenga un formato similar a:

```
Director Name 1
Video Title 1 - Client Name 1
Video Title 2 - Client Name 2

Director Name 2
Video Title 3 - Client Name 3
Video Title 4 - Client Name 4
```

### Reglas de Parsing

- **Nombres de directores**: Líneas que no contienen separadores (`-`, `|`, `–`, `—`)
- **Videos**: Líneas que contienen separadores entre título y cliente
- **Slugs**: Se generan automáticamente a partir del nombre del director
- **IDs**: Se generan siguiendo el patrón `director-slug-cliente-numero`

## Datos Generados

Para cada director se crea:
- **Entry de Director** con campos:
  - `name`: Nombre del director
  - `slug`: URL amigable
  - `order`: Orden de aparición
  - `videos`: Referencias a los videos

Para cada video se crea:
- **Entry de Director Video** con campos:
  - `id`: Identificador único
  - `title`: Título del video
  - `client`: Cliente/marca
  - `vimeoId`: **PLACEHOLDER** (necesita actualización manual)
  - `order`: Orden dentro del director

## ⚠️ Importante

1. **Vimeo IDs**: Todos los Vimeo IDs se establecen como PLACEHOLDER
2. **Actualización manual**: Debes actualizar manualmente los Vimeo IDs reales en Contentful
3. **Thumbnail IDs**: No se incluyen automáticamente, se pueden agregar después
4. **Verificación**: Siempre verifica los datos en Contentful después de la subida

## Pasos Posteriores

Después de ejecutar el script:

1. **Ir a Contentful** y verificar los directores subidos
2. **Actualizar Vimeo IDs** con los valores reales
3. **Agregar Thumbnail IDs** si están disponibles
4. **Probar el sitio web** para asegurar que todo funciona correctamente

## Solución de Problemas

### Error de conexión a Contentful
- Verifica que `CONTENTFUL_MANAGEMENT_TOKEN` esté configurado
- Asegúrate de que el token tenga permisos de gestión

### Error de parsing del DOCX
- Verifica el formato del archivo .docx
- Asegúrate de que los separadores sean consistentes
- Revisa que los nombres de directores no contengan caracteres especiales

### Entradas duplicadas
- El script no verifica duplicados automáticamente
- Revisa manualmente en Contentful antes de ejecutar

## Estructura de Archivos

```
scripts/
├── upload-directors-from-docx.ts  # Script principal
└── ...

Direectores reels info.docx        # Archivo de datos (en raíz)
```

## Soporte

Si tienes problemas con el script:
1. Revisa los logs de error en la consola
2. Verifica el formato del archivo .docx
3. Confirma que las variables de entorno estén configuradas correctamente
