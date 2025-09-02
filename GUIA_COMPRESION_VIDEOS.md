# 🎬 Guía de Compresión de Videos para Bristol

## 📋 Resumen
Esta guía te enseñará cómo comprimir videos para el sitio web de Bristol usando **FFmpeg**, una herramienta profesional de compresión de video.

---

## 🎯 Objetivo
- **Reducir el tamaño** de los videos sin perder calidad visual
- **Mejorar la velocidad** de carga del sitio web
- **Optimizar para móviles** y conexiones lentas

---

## 🛠️ Instalación de FFmpeg

### **En Mac:**
```bash
# Instalar Homebrew (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar FFmpeg
brew install ffmpeg
```

### **En Windows:**
1. Descargar FFmpeg desde: https://ffmpeg.org/download.html
2. Extraer el archivo ZIP
3. Agregar la carpeta `bin` al PATH del sistema

### **En Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

---

## 🎬 Comandos de Compresión

### **1. Compresión Básica (Recomendada)**
```bash
ffmpeg -i video_original.mp4 -c:v libvpx-vp9 -crf 25 -b:v 0 -b:a 96k -c:a libopus -speed 4 video_optimizado.webm
```

### **2. Compresión Ultra (Máximo ahorro)**
```bash
ffmpeg -i video_original.mp4 -c:v libvpx-vp9 -crf 35 -b:v 0 -b:a 96k -c:a libopus -speed 4 video_ultra.webm
```

### **3. Compresión para Móvil (720p)**
```bash
ffmpeg -i video_original.mp4 -c:v libvpx-vp9 -crf 25 -b:v 0 -b:a 96k -c:a libopus -vf "scale=1280:720" -speed 4 video_mobile.webm
```

---

## 📊 Niveles de Calidad

| CRF | Calidad | Reducción | Uso Recomendado |
|-----|---------|-----------|-----------------|
| **20** | Excelente | -30% | Videos premium |
| **25** | Muy Buena | -50% | **Recomendado** |
| **30** | Buena | -60% | Uso general |
| **35** | Aceptable | -70% | Conexiones lentas |
| **40** | Básica | -80% | Solo para emergencias |

---

## 🚀 Proceso Paso a Paso

### **Paso 1: Preparar el video**
1. Coloca tu video original en una carpeta
2. Abre la terminal/consola
3. Navega a la carpeta del video:
   ```bash
   cd /ruta/a/tu/video
   ```

### **Paso 2: Comprimir el video**
```bash
ffmpeg -i mi_video.mp4 -c:v libvpx-vp9 -crf 25 -b:v 0 -b:a 96k -c:a libopus -speed 4 mi_video_optimizado.webm
```

### **Paso 3: Verificar el resultado**
```bash
# Ver el tamaño del archivo
ls -lh mi_video_optimizado.webm

# Ver información del video
ffprobe mi_video_optimizado.webm
```

---

## 📱 Optimizaciones Específicas

### **Para Videos Hero (Pantalla completa):**
```bash
ffmpeg -i video.mp4 -c:v libvpx-vp9 -crf 25 -b:v 0 -b:a 96k -c:a libopus -speed 4 -threads 0 -tile-columns 2 -frame-parallel 1 video_hero.webm
```

### **Para Videos de Móvil:**
```bash
ffmpeg -i video.mp4 -c:v libvpx-vp9 -crf 25 -b:v 0 -b:a 96k -c:a libopus -vf "scale=1280:720" -speed 4 video_mobile.webm
```

### **Para Videos Largos:**
```bash
ffmpeg -i video.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 96k -c:a libopus -speed 4 -threads 0 video_largo.webm
```

---

## ⚡ Consejos de Optimización

### **Antes de Comprimir:**
- ✅ **Resolución**: Máximo 1920x1080 (Full HD)
- ✅ **Duración**: Idealmente menos de 30 segundos
- ✅ **Formato**: MP4 o MOV como entrada
- ✅ **Audio**: Estéreo, 48kHz

### **Durante la Compresión:**
- ✅ **CRF 25**: Balance perfecto calidad/tamaño
- ✅ **Speed 4**: Conversión rápida
- ✅ **Threads 0**: Usa todos los núcleos del CPU
- ✅ **Tile-columns 2**: Mejora la paralelización

### **Después de Comprimir:**
- ✅ **Verificar**: Reproducir el video
- ✅ **Tamaño**: Debe ser 50-70% más pequeño
- ✅ **Calidad**: No debe verse pixelado
- ✅ **Audio**: Debe sonar claro

---

## 🔧 Solución de Problemas

### **Error: "ffmpeg not found"**
```bash
# Verificar instalación
ffmpeg -version

# Si no está instalado, reinstalar
brew install ffmpeg  # Mac
```

### **Error: "Permission denied"**
```bash
# Dar permisos de ejecución
chmod +x ffmpeg
```

### **Video muy grande después de comprimir**
```bash
# Usar CRF más alto (35 o 40)
ffmpeg -i video.mp4 -c:v libvpx-vp9 -crf 35 -b:v 0 -b:a 96k -c:a libopus -speed 4 video_small.webm
```

### **Video con calidad muy baja**
```bash
# Usar CRF más bajo (20 o 25)
ffmpeg -i video.mp4 -c:v libvpx-vp9 -crf 20 -b:v 0 -b:a 96k -c:a libopus -speed 4 video_quality.webm
```

---

## 📈 Resultados Esperados

### **Antes de la Optimización:**
- Tamaño: 10-50 MB
- Formato: MP4
- Carga: Lenta en móviles

### **Después de la Optimización:**
- Tamaño: 3-15 MB (50-70% reducción)
- Formato: WebM
- Carga: Rápida en todos los dispositivos

---

## 🎯 Comando Final Recomendado

Para la mayoría de casos, usa este comando:

```bash
ffmpeg -i tu_video.mp4 -c:v libvpx-vp9 -crf 25 -b:v 0 -b:a 96k -c:a libopus -speed 4 -threads 0 tu_video_optimizado.webm
```

**Reemplaza:**
- `tu_video.mp4` → Nombre de tu video original
- `tu_video_optimizado.webm` → Nombre que quieres para el video comprimido

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que FFmpeg esté instalado correctamente
2. Asegúrate de que el video original no esté corrupto
3. Prueba con un video más corto primero
4. Contacta al equipo técnico si persisten los problemas

---

**¡Listo! Con esta guía podrás comprimir videos profesionales para Bristol.** 🚀
