# Generador de Thumbnails para Figma

Este script te permite generar imágenes de thumbnails de todos los videos de un director específico para trabajar en diseños de Figma.

## 🚀 Uso

### Para un director específico:
```bash
npm run generate-thumbnails <director-slug>
```

### Para todos los directores:
```bash
npm run generate-thumbnails --all
```

### Ver directores disponibles:
```bash
npm run generate-thumbnails
```

## 📁 Estructura de archivos generados

Los thumbnails se guardan en:
```
thumbnails/
├── lemon/
│   ├── 01-purpose-rexona.jpg
│   ├── 02-100-years-pepsodent.jpg
│   ├── 03-si-a-todo-pepsi.jpg
│   └── ...
├── ivan-jurado/
│   ├── 01-video-title-client.jpg
│   └── ...
└── ...
```

## 🎬 Directores disponibles

- `lemon` - Lemon (14 videos)
- `ivan-jurado` - Iván Jurado (X videos)
- `juan-camilo` - Juan Camilo (X videos)
- `juan-david` - Juan David (X videos)
- `juan-manuel` - Juan Manuel (X videos)
- `maria-gonzalez` - María González (X videos)
- `santiago-mesa` - Santiago Mesa (X videos)
- `sebastian-mesa` - Sebastián Mesa (X videos)

## 📋 Formato de nombres de archivos

Los archivos siguen este formato:
```
{orden}-{titulo-del-video}-{cliente}.jpg
```

Ejemplo: `01-purpose-rexona.jpg`

## 🔧 Detalles técnicos

- Las imágenes se descargan desde `vumbnail.com` usando el Vimeo ID de cada video
- Formato: JPG
- Resolución: Automática (optimizada por Vimeo)
- Organización: Por director y orden de aparición

## 💡 Tips para Figma

1. **Importar imágenes**: Arrastra las carpetas completas a Figma
2. **Organización**: Usa las carpetas por director para mantener orden
3. **Nombres**: Los nombres de archivo incluyen toda la información necesaria
4. **Orden**: Los números al inicio mantienen el orden correcto

## 🛠️ Desarrollo

El script está en `scripts/generate-thumbnails.ts` y usa:
- TypeScript para type safety
- Node.js HTTPS para descargas
- Sistema de archivos para organización
- Datos de `src/data/directors.ts`

