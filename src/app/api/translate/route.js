// app/api/translate/route.js
import { NextResponse } from 'next/server';

// Endpoint Azure Document Translator
const TRANSLATOR_ENDPOINT = 'https://flugzeug.cognitiveservices.azure.com/translator/document/batches';
const API_VERSION = '2024-05-01';
const API_KEY = process.env.AZURE_TRANSLATION_KEY || 'BfzPONiC74w3ozmFxqg7OnEqtaCi7XOvHv1vJUQRuivkJPgYfZQOJQQJ99BEAC5T7U2XJ3w3AAAbACOGsDqg';

// SAS URLs pour le stockage (à mettre dans des variables d'environnement en production)
const SOURCE_CONTAINER_SAS = "https://flugzeug.blob.core.windows.net/document-storage?sp=racwdli&st=2025-07-17T17:49:20Z&se=2026-07-17T02:04:20Z&spr=https&sv=2024-11-04&sr=c&sig=adGTgL7tOiRtNSclJ5StwFxhy9%2Bz5227dZQ7i2oI2vI%3D";
const TARGET_CONTAINER_SAS = "https://flugzeug.blob.core.windows.net/translated-documents-storage?sp=racwdli&st=2025-07-17T17:51:43Z&se=2026-07-17T02:06:43Z&spr=https&sv=2024-11-04&sr=c&sig=qklNLaU6MdyLNnfdcNs2tlEpuRVdmUzWBwu23XEJvos%3D";

export async function POST(request) {
  try {
    const { filename, targetLanguage } = await request.json();

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
              language: targetLanguage || 'en',
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
    const translatedUrl = `https://flugzeug.blob.core.windows.net/translated-documents-storage/${filename}?sp=racwdli&st=2025-07-17T17:51:43Z&se=2026-07-17T02:06:43Z&spr=https&sv=2024-11-04&sr=c&sig=qklNLaU6MdyLNnfdcNs2tlEpuRVdmUzWBwu23XEJvos%3D`;

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