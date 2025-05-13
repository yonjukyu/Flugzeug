// app/api/translate/route.js
import { NextResponse } from 'next/server';

// Endpoint Azure Document Translator
const TRANSLATOR_ENDPOINT = 'https://flugzeug.cognitiveservices.azure.com/translator/document/batches';
const API_VERSION = '2024-05-01';
const API_KEY = process.env.AZURE_TRANSLATOR_API_KEY || 'BfzPONiC74w3ozmFxqg7OnEqtaCi7XOvHv1vJUQRuivkJPgYfZQOJQQJ99BEAC5T7U2XJ3w3AAAbACOGsDqg';

// SAS URLs pour le stockage (à mettre dans des variables d'environnement en production)
const SOURCE_CONTAINER_SAS = 'https://flugzeug.blob.core.windows.net/document-storage?sp=racwdli&st=2025-05-13T15:31:38Z&se=2026-07-28T23:31:38Z&spr=https&sv=2024-11-04&sr=c&sig=W9TM9MWVChtNQRbQqTFvBDyEZ8Qx1req0zh%2BRxWh%2FKw%3D';
const TARGET_CONTAINER_SAS = 'https://flugzeug.blob.core.windows.net/translated-documents-storage?sp=racwdli&st=2025-05-13T15:32:13Z&se=2026-08-05T23:32:13Z&spr=https&sv=2024-11-04&sr=c&sig=1OZh81I45bXb0K3A1t%2F6X2rJGAxErSjFEQpT%2F3KZdao%3D';

export async function POST(request) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Préparation du corps de la requête pour l'API de traduction
    const requestBody = {
      inputs: [
        {
          source: {
            sourceUrl: SOURCE_CONTAINER_SAS,
            filter: {
              prefix: filename
            },
            storageSource: 'AzureBlob'
          },
          targets: [
            {
              targetUrl: TARGET_CONTAINER_SAS,
              language: 'en'
            }
          ]
        }
      ]
    };

    // Envoi de la requête à l'API Azure Document Translator
    const translationResponse = await fetch(
      `${TRANSLATOR_ENDPOINT}?api-version=${API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!translationResponse.ok) {
      const errorData = await translationResponse.json();
      throw new Error(`Translation API error: ${JSON.stringify(errorData)}`);
    }

    // L'API retourne l'ID du job de traduction
    const translationData = await translationResponse.json();
    
    // Récupération du statut et des détails de la traduction
    // Note: Dans un cas réel, vous utiliseriez un webhook ou un polling
    // pour vérifier l'état de la traduction qui peut prendre du temps
    
    // Pour l'exemple, on va récupérer directement les résultats
    // En production, vous devriez utiliser l'endpoint GET pour vérifier l'état
    const statusResponse = await fetch(
      `${TRANSLATOR_ENDPOINT}/${translationData.id}?api-version=${API_VERSION}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': API_KEY
        }
      }
    );

    if (!statusResponse.ok) {
      throw new Error('Failed to get translation status');
    }

    const statusData = await statusResponse.json();

    // Construction de l'URL du document traduit
    const translatedDocumentName = `${filename.split('.')[0]}_en.${filename.split('.')[1]}`;
    const translatedUrl = `${TARGET_CONTAINER_SAS}&prefix=${translatedDocumentName}`;

    return NextResponse.json({
      success: true,
      batchId: translationData.id,
      status: statusData.status,
      results: [
        {
          status: 'Succeeded', // Simulé pour l'exemple
          translatedUrl: translatedUrl
        }
      ]
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate document', details: error.message },
      { status: 500 }
    );
  }
}