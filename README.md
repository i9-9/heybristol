# 🎬 Bristol - Productora de Contenido Audiovisual

Sitio web oficial de Bristol, productora de contenido audiovisual.

## 🚀 Características

- Video background en loop con alta calidad
- Diseño responsive y moderno
- Botón de mute/unmute
- Botón de contacto directo por email
- Logo SVG escalable
- Optimización para SEO y redes sociales

## 📁 Estructura del Proyecto

```
bristol/
├── public/
│   ├── videos/           # Videos optimizados
│   ├── favicon/          # Favicon SVG
│   └── logo/             # Logo SVG
├── src/
│   ├── app/              # Páginas Next.js
│   └── components/       # Componentes React
└── scripts/              # Scripts de optimización
```

## 🎥 Optimización de Videos

### Scripts Disponibles

#### 1. Optimización Básica
```bash
node scripts/optimize-video.js input.mp4 output_optimized.mp4
```

#### 2. Presets de Calidad
```bash
node scripts/video-quality-presets.js input.mp4 [preset]
```

**Presets disponibles:**
- `ultra`: Calidad ultra alta (archivo grande)
- `high`: Calidad alta (recomendado)
- `medium`: Balance calidad/tamaño
- `mobile`: Optimizado para móvil

### Configuraciones de Calidad

#### Preset "Ultra" (Máxima Calidad)
- **MP4**: CRF 15, preset veryslow, audio 192k
- **WebM**: CRF 20, audio 192k
- **Uso**: Para videos críticos donde la calidad es prioritaria

#### Preset "High" (Recomendado)
- **MP4**: CRF 18, preset slow, audio 128k
- **WebM**: CRF 25, audio 128k
- **Uso**: Balance perfecto entre calidad y tamaño

#### Preset "Medium" (Balance)
- **MP4**: CRF 23, preset medium, audio 96k
- **WebM**: CRF 30, audio 96k
- **Uso**: Para ahorrar espacio manteniendo buena calidad

#### Preset "Mobile" (Optimizado)
- **MP4**: CRF 28, preset fast, audio 64k
- **WebM**: CRF 35, audio 64k
- **Uso**: Para conexiones lentas y dispositivos móviles

### Ejemplos de Uso

```bash
# Generar versión de alta calidad
node scripts/video-quality-presets.js original.mp4 high

# Generar versión ultra para desktop
node scripts/video-quality-presets.js original.mp4 ultra

# Generar versión móvil
node scripts/video-quality-presets.js original.mp4 mobile
```

## 🛠️ Desarrollo

### Instalación
```bash
npm install
```

### Desarrollo Local
```bash
npm run dev
```

### Build para Producción
```bash
npm run build
npm run export
```

## 📱 Videos en el Sitio

El sitio utiliza múltiples formatos de video para máxima compatibilidad:

1. **WebM** (primera opción): Mejor compresión, navegadores modernos
2. **MP4 optimizado**: Compatibilidad general
3. **MP4 móvil**: Para dispositivos móviles y conexiones lentas

### Estructura de Videos
```
public/videos/
├── under_construction.webm              # WebM principal
├── under_construction_optimized.mp4     # MP4 optimizado
├── under_construction_mobile.mp4        # MP4 móvil
└── under_construction.mp4               # MP4 original
```

## 🎯 Recomendaciones para Mejor Calidad

1. **Usar el preset "high"** para la mayoría de casos
2. **Generar WebM** para navegadores modernos (mejor compresión)
3. **Usar preset "ultra"** solo para videos críticos
4. **Probar diferentes presets** para encontrar el balance ideal
5. **Verificar la calidad** en diferentes dispositivos

## 📊 Comparación de Calidad

| Preset | CRF | Tamaño | Calidad | Uso Recomendado |
|--------|-----|--------|---------|-----------------|
| Ultra  | 15  | Grande | Excelente | Videos críticos |
| High   | 18  | Medio  | Muy Buena | General |
| Medium | 23  | Pequeño| Buena | Balance |
| Mobile | 28  | Muy Pequeño | Aceptable | Móvil |

## 🚀 Deploy

Ver `DEPLOY.md` para instrucciones detalladas de deploy.

---

**Bristol** - Productora de contenido audiovisual de alta calidad 🎬

