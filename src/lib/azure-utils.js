// lib/azure-utils.js

/**
 * Attends qu'une opération de traduction soit terminée avec gestion des délais et des nouvelles tentatives
 * @param {Function} checkStatusFn - Fonction qui vérifie le statut de l'opération
 * @param {number} maxWaitTimeMs - Temps d'attente maximum en millisecondes
 * @param {number} checkIntervalMs - Intervalle entre les vérifications en millisecondes
 * @returns {Promise<object>} - Le résultat final de l'opération
 */
export async function waitForOperationCompletion(
  checkStatusFn, 
  maxWaitTimeMs = 10 * 60 * 1000, // 10 minutes par défaut
  checkIntervalMs = 3000 // 3 secondes d'intervalle par défaut
) {
  const startTime = Date.now();
  let isCompleted = false;
  let lastStatus = null;
  
  while (!isCompleted && Date.now() - startTime < maxWaitTimeMs) {
    // Attendre l'intervalle spécifié
    await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    
    try {
      // Vérifier le statut
      const status = await checkStatusFn();
      lastStatus = status;
      
      // Pour les clients Azure REST, vérifier le statut dans la réponse
      if (status && status.body && status.body.status) {
        const operationStatus = status.body.status;
        
        if (operationStatus === 'Succeeded') {
          return status;
        } else if (operationStatus === 'Failed' || operationStatus === 'Cancelled') {
          throw new Error(`L'opération a échoué: ${status.body.error?.message || 'Raison inconnue'}`);
        }
        // Continuer d'attendre si le statut est 'NotStarted', 'Running' ou 'Validating'
      }
    } catch (error) {
      // Si l'erreur est liée au réseau, on continue à attendre
      if (error.name === 'NetworkError' || error.name === 'AbortError') {
        console.warn('Erreur réseau temporaire, nouvelle tentative...', error);
        continue;
      }
      
      // Sinon, propager l'erreur
      throw error;
    }
  }
  
  // Délai d'attente dépassé
  throw new Error(`Délai d'attente dépassé après ${Math.floor((Date.now() - startTime) / 1000)} secondes. Dernier statut: ${JSON.stringify(lastStatus?.body || 'inconnu')}`);
}

/**
 * Télécharge un document depuis Azure Blob Storage
 * @param {BlobClient} blobClient - Client Blob Azure pour le document
 * @returns {Promise<Buffer>} - Buffer contenant les données du document
 */
export async function downloadBlobToBuffer(blobClient) {
  try {
    const downloadResponse = await blobClient.download(0);
    const downloadStream = await downloadResponse.blobBody;
    const chunks = [];
    
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Erreur lors du téléchargement du blob:', error);
    throw new Error(`Erreur lors du téléchargement du document: ${error.message}`);
  }
}