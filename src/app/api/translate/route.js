// app/api/translate/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import { BlobServiceClient } from '@azure/storage-blob';

// URL de l'API Azure Document Translation fournie par votre collègue
const AZURE_TRANSLATOR_ENDPOINT = 'https://flugzeug.cognitiveservices.azure.com/';
const DOCUMENT_TRANSLATION_URL = `${AZURE_TRANSLATOR_ENDPOINT}translator/document/batches?api-version=2024-05-01`;

export async function POST(request) {
  try {
    // Traiter la requête multipart/form-data
    const formData = await request.formData();
    const file = formData.get('document');
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun document fourni' },
        { status: 400 }
      );
    }

    // Récupérer les options de traduction
    const sourceLanguage = formData.get('sourceLanguage') || 'auto';
    const targetLanguage = formData.get('targetLanguage') || 'fr';
    
    // Récupérer la clé API
    const translatorKey = process.env.AZURE_TRANSLATOR_KEY;
    const azureRegion = process.env.AZURE_TRANSLATOR_REGION;
    if (!translatorKey) {
      return NextResponse.json(
        { error: 'Clé API Azure Translator non configurée' },
        { status: 500 }
      );
    }
    
    // Récupérer la chaîne de connexion au stockage Azure
    const storageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!storageConnectionString) {
      return NextResponse.json(
        { error: 'Chaîne de connexion au stockage Azure non configurée' },
        { status: 500 }
      );
    }

    // Créer un client de service Blob
    const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);

    // Créer ou récupérer les conteneurs source et cible
    const sourceContainerName = 'source-documents';
    const targetContainerName = 'translated-documents';
    
    const sourceContainerClient = blobServiceClient.getContainerClient(sourceContainerName);
    const targetContainerClient = blobServiceClient.getContainerClient(targetContainerName);

    // Assurer que les conteneurs existent
    await sourceContainerClient.createIfNotExists({ access: 'blob' });
    await targetContainerClient.createIfNotExists({ access: 'blob' });

    // Générer des noms uniques pour les blobs
    const timestamp = new Date().getTime();
    const originalFileName = file.name;
    const fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'));
    const fileNameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
    
    const sourceBlobName = `${fileNameWithoutExt}-${timestamp}${fileExtension}`;
    const targetBlobName = `${fileNameWithoutExt}-${targetLanguage}-${timestamp}${fileExtension}`;

    // Obtenir les bytes du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Télécharger le fichier source vers le conteneur source
    const blockBlobClient = sourceContainerClient.getBlockBlobClient(sourceBlobName);
    await blockBlobClient.upload(buffer, buffer.length);

    // Obtenir les SAS URIs pour les conteneurs source et cible
    const sourceSasUrl = await generateSasUrl(sourceContainerClient);
    const targetSasUrl = await generateSasUrl(targetContainerClient);

    // Préparer la requête pour lancer la traduction du document
    const translationInput = {
      inputs: [
        {
          source: {
            sourceUrl: `${sourceSasUrl}/${sourceBlobName}`,
            storageSource: 'AzureBlob',
            language: sourceLanguage === 'auto' ? null : sourceLanguage
          },
          targets: [
            {
              targetUrl: `${targetSasUrl}/${targetBlobName}`,
              storageSource: 'AzureBlob',
              language: targetLanguage
            }
          ]
        }
      ]
    };

    // Utiliser l'URL spécifique fournie par votre collègue avec authentification par clé
    const translationResponse = await axios({
      method: 'post',
      url: DOCUMENT_TRANSLATION_URL,
      headers: {
        'Ocp-Apim-Subscription-Key': translatorKey,
        'Ocp-Apim-Subscription-Region': azureRegion,
        'Content-Type': 'application/json'
      },
      data: translationInput
    });

// Récupérer correctement l'ID de l'opération de traduction
// Il peut être dans les en-têtes ou dans le corps de la réponse
let operationId = translationResponse.headers['operation-location'];

// Journaliser les informations pour débogage
console.log('Headers de réponse:', translationResponse.headers);
console.log('Operation-Location header:', operationId);
console.log('Données de réponse:', translationResponse.data);

// S'il n'est pas dans les en-têtes, cherchez-le dans la réponse
if (!operationId && translationResponse.data && translationResponse.data.id) {
  operationId = translationResponse.data.id;
}

if (!operationId) {
  return NextResponse.json(
    { error: 'Impossible de récupérer l\'identifiant de l\'opération de traduction' },
    { status: 500 }
  );
}

// Retourner l'ID de l'opération ainsi que les autres infos nécessaires
return NextResponse.json({
  message: 'Traduction lancée avec succès',
  operationId, // Assurez-vous que c'est une URL complète que l'API check-translation peut appeler
  sourceBlobName,
  targetBlobName,
  containerName: targetContainerName
}, { status: 202 });

  } catch (error) {
    console.error('Erreur lors de la traduction:', error);
    return NextResponse.json({
      error: 'Erreur lors de la traduction du document',
      details: error.message
    }, { status: 500 });
  }
}

// Fonction simple pour générer un URL SAS pour un conteneur
async function generateSasUrl(containerClient) {
  try {
    // Créer une date d'expiration (1 heure dans le futur)
    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + 1);
    
    // Générer l'URL SAS avec les permissions de lecture, écriture et liste
    const sasUrl = await containerClient.generateSasUrl({
      permissions: "rwl", // read, write, list
      expiresOn: expiresOn
    });
    
    return sasUrl;
  } catch (error) {
    console.error("Erreur lors de la génération du SAS:", error);
    throw error;
  }
}