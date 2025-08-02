# 🚀 Deploy Instructions for heybristol.com

## Archivos listos para producción
La carpeta `/out` contiene todos los archivos optimizados y listos para subir al servidor.

## Pasos para el deploy:

### 1. Generar archivos estáticos
```bash
npm run export
```

### 2. Subir al servidor
Subir **todo el contenido** de la carpeta `/out/` al directorio raíz de tu dominio en el hosting.

### 3. Configuración del servidor
El sitio debe servirse desde la raíz del dominio: `https://heybristol.com`

## 📁 Estructura de archivos en el servidor:
```
/public_html/ (o directorio raíz)
├── index.html
├── 404.html
├── favicon/
│   └── favicon.svg
├── logo/
│   └── SVG/
│       └── logo.svg
└── _next/
    ├── static/
    └── chunks/
```

## ✅ Características implementadas:
- Static export optimizado
- SEO meta tags para redes sociales
- Favicon SVG configurado
- Preconnect a Vimeo para carga rápida
- Responsive design
- Compatibilidad con hosting tradicional

## 🔧 Configuración del dominio:
- URL base: `https://heybristol.com`
- OpenGraph y Twitter Cards configurados
- Metadatos optimizados para SEO

## 📱 Funcionalidades:
- Video background de Vimeo en loop
- Botón de mute/unmute
- Botón de copia de email con notificación
- Logo SVG escalable
- Diseño mobile-first

¡Todo listo para producción! 🎉