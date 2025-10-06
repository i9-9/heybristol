/**
 * Contentful to Vercel Webhook Filter
 * 
 * Esta función serverless actúa como intermediario entre Contentful y Vercel,
 * filtrando webhooks para evitar deploys innecesarios y respetar los límites
 * del plan gratuito de Vercel (100 deploys/día).
 */

const crypto = require('crypto');

// Configuración
const CONFIG = {
  MIN_DEPLOY_INTERVAL: 10, // minutos
  IMPORTANT_EVENTS: ['publish', 'unpublish'],
  IMPORTANT_CONTENT_TYPES: ['director', 'video', 'client'],
  MAX_CHANGE_ACCUMULATION_TIME: 30, // minutos
  MIN_CHANGES_FOR_DEPLOY: 1
};

/**
 * Clase para manejar el almacenamiento de estado
 * En producción, usar Redis, DynamoDB, o similar
 */
class StateManager {
  constructor() {
    // En producción, usar almacenamiento persistente
    this.state = {
      lastDeployTime: null,
      pendingChanges: [],
      deployInProgress: false
    };
  }

  async getLastDeployTime() {
    // TODO: Implementar lectura desde almacenamiento persistente
    return this.state.lastDeployTime;
  }

  async setLastDeployTime(timestamp) {
    // TODO: Implementar escritura a almacenamiento persistente
    this.state.lastDeployTime = timestamp;
  }

  async addPendingChange(change) {
    // TODO: Implementar escritura a almacenamiento persistente
    this.state.pendingChanges.push({
      ...change,
      timestamp: Date.now()
    });
  }

  async getPendingChanges() {
    // TODO: Implementar lectura desde almacenamiento persistente
    return this.state.pendingChanges;
  }

  async clearPendingChanges() {
    // TODO: Implementar limpieza en almacenamiento persistente
    this.state.pendingChanges = [];
  }

  async setDeployInProgress(status) {
    // TODO: Implementar escritura a almacenamiento persistente
    this.state.deployInProgress = status;
  }

  async isDeployInProgress() {
    // TODO: Implementar lectura desde almacenamiento persistente
    return this.state.deployInProgress;
  }
}

/**
 * Clase para manejar la integración con Vercel
 */
class VercelClient {
  constructor(apiToken, projectId, teamId = null) {
    this.apiToken = apiToken;
    this.projectId = projectId;
    this.teamId = teamId;
    this.baseUrl = 'https://api.vercel.com';
  }

  async triggerDeploy() {
    try {
      const url = `${this.baseUrl}/v1/deployments`;
      const headers = {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      };

      const body = {
        name: this.projectId,
        ...(this.teamId && { teamId: this.teamId })
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Vercel API error: ${response.status} - ${error}`);
      }

      const deployment = await response.json();
      console.log('Deploy triggered successfully:', deployment.id);
      
      return {
        success: true,
        deploymentId: deployment.id,
        url: deployment.url
      };
    } catch (error) {
      console.error('Error triggering Vercel deploy:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Valida la firma del webhook de Contentful
 */
function validateContentfulSignature(payload, signature, secret) {
  if (!secret) {
    console.warn('No webhook secret configured, skipping signature validation');
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Determina si un evento es importante y debe considerarse para deploy
 */
function isImportantEvent(event) {
  return CONFIG.IMPORTANT_EVENTS.includes(event);
}

/**
 * Determina si un tipo de contenido es importante
 */
function isImportantContentType(contentType) {
  return CONFIG.IMPORTANT_CONTENT_TYPES.includes(contentType);
}

/**
 * Verifica si ha pasado suficiente tiempo desde el último deploy
 */
function canDeployNow(lastDeployTime) {
  if (!lastDeployTime) return true;
  
  const timeSinceLastDeploy = Date.now() - lastDeployTime;
  const minIntervalMs = CONFIG.MIN_DEPLOY_INTERVAL * 60 * 1000;
  
  return timeSinceLastDeploy >= minIntervalMs;
}

/**
 * Limpia cambios pendientes antiguos
 */
function cleanOldPendingChanges(pendingChanges) {
  const maxAgeMs = CONFIG.MAX_CHANGE_ACCUMULATION_TIME * 60 * 1000;
  const cutoffTime = Date.now() - maxAgeMs;
  
  return pendingChanges.filter(change => change.timestamp > cutoffTime);
}

/**
 * Función principal del webhook handler
 */
async function handler(req, res) {
  try {
    // Validar que sea un POST request
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Obtener variables de entorno
    const {
      VERCEL_TOKEN,
      VERCEL_PROJECT_ID,
      VERCEL_TEAM_ID,
      CONTENTFUL_WEBHOOK_SECRET
    } = process.env;

    // Si no hay variables de entorno, responder con error pero no fallar
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
      console.log('Missing environment variables, skipping deploy');
      return res.status(200).json({ 
        message: 'Missing environment variables',
        skipped: true 
      });
    }

    // Validar firma del webhook (opcional pero recomendado)
    const signature = req.headers['x-contentful-signature'];
    const payload = JSON.stringify(req.body);
    
    if (CONTENTFUL_WEBHOOK_SECRET && !validateContentfulSignature(payload, signature, CONTENTFUL_WEBHOOK_SECRET)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('Received Contentful webhook:', {
      event: req.body.sys?.type,
      contentType: req.body.sys?.contentType?.sys?.id,
      id: req.body.sys?.id
    });

    // Inicializar clientes
    const stateManager = new StateManager();
    const vercelClient = new VercelClient(VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID);

    // Verificar si ya hay un deploy en progreso
    if (await stateManager.isDeployInProgress()) {
      console.log('Deploy already in progress, skipping');
      return res.status(200).json({ 
        message: 'Deploy already in progress',
        skipped: true 
      });
    }

    // Determinar si este evento es importante
    const eventType = req.body.sys?.type;
    const contentType = req.body.sys?.contentType?.sys?.id;
    
    const isImportant = isImportantEvent(eventType) && isImportantContentType(contentType);
    
    if (!isImportant) {
      console.log('Event not important, skipping deploy');
      return res.status(200).json({ 
        message: 'Event not important',
        skipped: true,
        eventType,
        contentType
      });
    }

    // Agregar cambio pendiente
    await stateManager.addPendingChange({
      eventType,
      contentType,
      contentId: req.body.sys?.id,
      timestamp: Date.now()
    });

    // Obtener cambios pendientes y limpiar los antiguos
    let pendingChanges = await stateManager.getPendingChanges();
    pendingChanges = cleanOldPendingChanges(pendingChanges);

    // Verificar si tenemos suficientes cambios
    if (pendingChanges.length < CONFIG.MIN_CHANGES_FOR_DEPLOY) {
      console.log(`Not enough changes for deploy: ${pendingChanges.length}/${CONFIG.MIN_CHANGES_FOR_DEPLOY}`);
      return res.status(200).json({ 
        message: 'Not enough changes for deploy',
        pendingChanges: pendingChanges.length,
        required: CONFIG.MIN_CHANGES_FOR_DEPLOY
      });
    }

    // Verificar si podemos hacer deploy ahora
    const lastDeployTime = await stateManager.getLastDeployTime();
    if (!canDeployNow(lastDeployTime)) {
      console.log('Too soon since last deploy, skipping');
      return res.status(200).json({ 
        message: 'Too soon since last deploy',
        lastDeployTime,
        minInterval: CONFIG.MIN_DEPLOY_INTERVAL
      });
    }

    // Marcar deploy en progreso
    await stateManager.setDeployInProgress(true);

    try {
      // Triggerar deploy en Vercel
      const deployResult = await vercelClient.triggerDeploy();
      
      if (deployResult.success) {
        // Actualizar timestamp del último deploy
        await stateManager.setLastDeployTime(Date.now());
        
        // Limpiar cambios pendientes
        await stateManager.clearPendingChanges();
        
        console.log('Deploy triggered successfully:', deployResult.deploymentId);
        
        return res.status(200).json({
          message: 'Deploy triggered successfully',
          deploymentId: deployResult.deploymentId,
          url: deployResult.url,
          changesProcessed: pendingChanges.length
        });
      } else {
        throw new Error(deployResult.error);
      }
    } finally {
      // Siempre marcar deploy como no en progreso
      await stateManager.setDeployInProgress(false);
    }

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

module.exports = handler;
