# Contentful-Vercel Webhook Filter

Sistema de filtrado inteligente para optimizar deploys entre Contentful y Vercel, diseñado para respetar los límites del plan gratuito de Vercel (100 deploys/día).

## 🎯 Características

- **Filtrado inteligente**: Solo deploys para eventos importantes (`publish`, `unpublish`)
- **Rate limiting**: Intervalo mínimo de 10 minutos entre deploys
- **Acumulación de cambios**: Agrupa múltiples cambios antes de deployar
- **Compatible con plan gratuito**: Reduce deploys en 90%+
- **Misma URL**: No requiere cambios en Contentful

## 🚀 Instalación

### 1. Configurar Variables de Entorno en Vercel

En Vercel Dashboard > Settings > Environment Variables:

```
VERCEL_TOKEN=tu_token_de_vercel
VERCEL_PROJECT_ID=tu_project_id
VERCEL_TEAM_ID=tu_team_id (opcional)
CONTENTFUL_WEBHOOK_SECRET=tu_webhook_secret (opcional)
```

### 2. Configurar Webhook en Contentful

1. Ve a **Settings > Webhooks** en tu espacio de Contentful
2. Configura:
   - **URL**: `https://tu-proyecto.vercel.app/api/webhook/contentful`
   - **Method**: POST
   - **Events**: Solo `publish` y `unpublish`
   - **Content Types**: Solo `director`, `video`, `client`

### 3. Desplegar

La función `api/webhook/contentful.js` se desplegará automáticamente con tu proyecto.

## 📊 Flujo de Trabajo

```
Contentful → Webhook → Función Filtrada → Vercel → Deploy Inteligente
```

### Eventos Filtrados

- ✅ **publish/unpublish** → Dispara deploy
- ❌ **create/update/delete** → No dispara deploy

### Rate Limiting

- Intervalo mínimo: 10 minutos entre deploys
- Acumulación: Múltiples cambios = 1 deploy
- Prevención: Deploys simultáneos bloqueados

## 🔧 Configuración Avanzada

### Personalizar Configuración

Edita las constantes en `api/webhook/contentful.js`:

```javascript
const CONFIG = {
  MIN_DEPLOY_INTERVAL: 10,        // Minutos entre deploys
  IMPORTANT_EVENTS: ['publish', 'unpublish'],
  IMPORTANT_CONTENT_TYPES: ['director', 'video', 'client'],
  MAX_CHANGE_ACCUMULATION_TIME: 30,  // Minutos para acumular cambios
  MIN_CHANGES_FOR_DEPLOY: 1       // Cambios mínimos para deployar
};
```

## 📈 Beneficios

- **90%+ reducción** en deploys innecesarios
- **Respeta límites** del plan gratuito de Vercel
- **Mejor rendimiento** con deploys solo cuando es necesario
- **Transición transparente** - misma URL del webhook

## 🚨 Troubleshooting

### Error: "The deployment could not be found"
- Verificar que la función esté desplegada
- Revisar variables de entorno en Vercel

### Error: "Missing required environment variables"
- Configurar `VERCEL_TOKEN` y `VERCEL_PROJECT_ID`

### Demasiados deploys
- Aumentar `MIN_DEPLOY_INTERVAL`
- Revisar configuración de eventos en Contentful

## 📝 Notas

- Los archivos de configuración local están excluidos del git
- La función usa almacenamiento en memoria (para producción usar Vercel KV)
- Compatible con Next.js y Vercel Functions

---

**Sistema optimizado para el plan gratuito de Vercel** 🚀
