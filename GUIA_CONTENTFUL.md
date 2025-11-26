# Guía de Contentful para Bristol

## Introducción

Esta guía te ayudará a gestionar el contenido de la página web de Bristol usando Contentful. Podrás agregar, editar y organizar directores, videos y contenido editorial de manera fácil y eficiente.

## Acceso a Contentful

1. **URL de acceso**: [app.contentful.com](https://app.contentful.com)
2. **Credenciales**: Contacta al equipo técnico para obtener acceso
3. **Espacio de trabajo**: Bristol Production

## Estructura de Contenido

### 1. Directores (Content Type: `director`)

Los directores son los creadores principales de contenido. Cada director tiene:

#### Campos del Director:
- **Name** (Texto): Nombre del director (ej: "Lemon", "Iván Jurado")
- **Slug** (Texto): URL amigable (ej: "lemon", "ivan-jurado")
- **Order** (Número): Orden de aparición en la página (1, 2, 3...)
- **Videos** (Referencias): Lista de videos asociados al director

#### Cómo crear un nuevo director:
1. Ve a "Content" → "Add entry"
2. Selecciona "Director"
3. Completa los campos:
   - **Name**: Nombre completo del director
   - **Slug**: Versión en minúsculas sin espacios (ej: "maria-gonzalez")
   - **Order**: Número secuencial (siguiente número disponible)
   - **Videos**: Deja vacío por ahora, se agregarán después
4. Guarda y publica

### 2. Videos de Directores (Content Type: `directorVideo`)

Cada video pertenece a un director y contiene la información del proyecto.

#### Campos del Video:
- **ID** (Texto): Identificador único (ej: "lemon-rexona-1")
- **Title** (Texto): Título del video (ej: "Purpose")
- **Client** (Texto): Cliente o marca (ej: "Rexona")
- **Vimeo ID** (Texto): ID del video en Vimeo (ej: "1107773548")
- **Thumbnail ID** (Texto, opcional): ID del video thumbnail en Vimeo
- **Order** (Número): Orden de aparición en la galería del director

#### Cómo crear un nuevo video:
1. Ve a "Content" → "Add entry"
2. Selecciona "Director Video"
3. Completa los campos:
   - **ID**: Formato "director-slug-cliente-numero" (ej: "lemon-coca-cola-15")
   - **Title**: Título descriptivo del video
   - **Client**: Nombre de la marca o cliente
   - **Vimeo ID**: Número que aparece en la URL de Vimeo
   - **Thumbnail ID**: ID del video de preview (opcional)
   - **Order**: Número secuencial dentro del director
4. Guarda y publica

#### Cómo asociar un video a un director:
1. Edita el director correspondiente
2. En el campo "Videos", haz clic en "Add reference"
3. Busca y selecciona el video que quieres asociar
4. Guarda y publica

### 3. Videos Hero (Content Type: `heroVideo`)

Videos que aparecen en la sección principal de la página.

#### Campos del Video Hero:
- **ID** (Texto): Identificador único
- **Title** (Texto): Título del video
- **Description** (Texto largo, opcional): Descripción del video
- **WebM Video** (Archivo): Video en formato WebM (recomendado)
- **MP4 Video** (Archivo): Video en formato MP4 (compatible)
- **Mobile Video** (Archivo): Versión optimizada para móviles
- **Vimeo ID** (Texto, opcional): ID de Vimeo como respaldo
- **Order** (Número): Orden de aparición

#### Cómo crear un video hero:
1. Ve a "Content" → "Add entry"
2. Selecciona "Hero Video"
3. Completa los campos:
   - **ID**: Identificador único (ej: "hero-video-1")
   - **Title**: Título descriptivo
   - **Description**: Descripción opcional
   - **WebM Video**: Sube el archivo .webm (recomendado)
   - **MP4 Video**: Sube el archivo .mp4
   - **Mobile Video**: Sube versión optimizada para móviles
   - **Vimeo ID**: ID de Vimeo (opcional)
   - **Order**: Número de orden
4. Guarda y publica

### 4. Videos Editoriales (Content Type: `editorialVideo`)

Videos que aparecen en la sección de directores.

#### Campos del Video Editorial:
- **ID** (Texto): Identificador único
- **Title** (Texto): Título del video
- **Description** (Texto largo, opcional): Descripción
- **WebM Video** (Archivo): Video en formato WebM
- **MP4 Video** (Archivo): Video en formato MP4
- **Mobile Video** (Archivo): Versión móvil
- **Order** (Número): Orden de aparición

### 5. Audio Tracks (Content Type: `audioTrack`)

Pistas de audio para acompañar videos.

#### Campos del Audio Track:
- **ID** (Texto): Identificador único
- **Title** (Texto): Título de la pista
- **Audio File** (Archivo): Archivo de audio (MP3, WAV, etc.)

## Mejores Prácticas

### Nomenclatura de Archivos
- **Videos**: `director-cliente-titulo.webm` (ej: "lemon-rexona-purpose.webm")
- **Imágenes**: `director-cliente-titulo.jpg`
- **Audio**: `track-titulo.mp3`

### Formatos Recomendados
- **Videos WebM**: Formato principal, mejor compresión
- **Videos MP4**: Formato de respaldo, mayor compatibilidad
- **Videos Móviles**: Resolución reducida, archivo más pequeño
- **Audio**: MP3 o WAV, máximo 5MB

### Tamaños de Archivo
- **Videos WebM**: Máximo 50MB
- **Videos MP4**: Máximo 100MB
- **Videos Móviles**: Máximo 25MB
- **Audio**: Máximo 5MB

## Flujo de Trabajo Recomendado

### 1. Agregar un nuevo director con videos:
1. Crear el director con su información básica
2. Crear todos los videos del director
3. Asociar los videos al director
4. Verificar el orden de aparición
5. Publicar todo el contenido

### 2. Actualizar contenido existente:
1. Buscar el contenido en Contentful
2. Editar los campos necesarios
3. Guardar los cambios
4. Publicar la actualización

### 3. Agregar videos hero:
1. Preparar los archivos en los formatos correctos
2. Crear la entrada de video hero
3. Subir los archivos
4. Configurar el orden
5. Publicar

## Consejos Importantes

### IDs y Slugs
- Los **IDs** deben ser únicos y descriptivos
- Los **slugs** deben ser URL-friendly (sin espacios, caracteres especiales)
- Usa guiones para separar palabras en slugs

### Orden de Contenido
- El campo **Order** determina la secuencia de aparición
- Los números más bajos aparecen primero
- Mantén la numeración secuencial

### Vimeo Integration
- El **Vimeo ID** es el número que aparece en la URL del video
- El **Thumbnail ID** es opcional pero recomendado para mejor rendimiento
- Los videos privados de Vimeo requieren el campo **Hash**

### Publicación
- Siempre **publica** el contenido después de editarlo
- El contenido no publicado no aparecerá en la página web
- Puedes guardar como borrador para trabajar sin publicar

## Solución de Problemas

### Video no aparece en la página:
1. Verifica que esté publicado
2. Confirma que el Vimeo ID sea correcto
3. Revisa que esté asociado al director correcto

### Error al subir archivos:
1. Verifica el formato del archivo
2. Confirma que no exceda el tamaño máximo
3. Intenta con un archivo más pequeño

### Problemas de orden:
1. Revisa los números en el campo "Order"
2. Asegúrate de que no haya números duplicados
3. Los números más bajos aparecen primero

## Contacto de Soporte

Si tienes problemas o preguntas:
- **Email técnico**: [email del desarrollador]
- **Documentación**: [enlace a documentación técnica]
- **Urgencias**: [teléfono de contacto]

---

*Esta guía se actualiza regularmente. Mantén este documento a mano para consultas futuras.*



