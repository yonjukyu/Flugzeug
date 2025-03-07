// app/api/check-translation/route.js - version améliorée
import { NextResponse } from 'next/server';
import axios from 'axios';
import { BlobServiceClient } from '@azure/storage-blob';

export async function POST(request) {
  try {
    // Récupérer les données de la requête
    const body = await request.json();
    const { operationId, targetBlobName, containerName } = body;
    
    console.log("Vérification de traduction demandée:", { operationId, targetBlobName, containerName });
    
    if (!operationId) {
      return NextResponse.json(
        { error: 'Identifiant d\'opération manquant' },
        { status: 400 }
      );
    }

    // Récupérer la clé API Translator
    const translatorKey = process.env.AZURE_TRANSLATOR_KEY;
    if (!translatorKey) {
      return NextResponse.json(
        { error: 'Clé API Azure Translator non configurée' },
        { status: 500 }
      );
    }

    // Vérifier l'état de la traduction auprès d'Azure
    console.log("Appel à l'URL d'opération:", operationId);
    
    const statusResponse = await axios({
      method: 'get',
      url: operationId,
      headers: {
        'Ocp-Apim-Subscription-Key': translatorKey,
        'Ocp-Apim-Subscription-Region': process.env.AZURE_TRANSLATOR_REGION,
        'Content-Type': 'application/json'
      }
    });

    console.log("Réponse de statut reçue:", statusResponse.status);
    console.log("Données de statut:", statusResponse.data);

    const translationStatus = statusResponse.data.status;

    // Si la traduction est terminée avec succès et que nous avons les informations du blob
    if (translationStatus === 'Succeeded' && targetBlobName && containerName) {
      console.log("Traduction réussie, génération de l'URL de téléchargement");
      
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
      
      // Récupérer le client du conteneur
      const containerClient = blobServiceClient.getContainerClient(containerName);
      
      // Récupérer le client du blob
      const blobClient = containerClient.getBlobClient(targetBlobName);
      
      // Générer une URL SAS pour le téléchargement
      const expiresOn = new Date();
      expiresOn.setHours(expiresOn.getHours() + 1); // Expiration dans 1 heure
      
      const sasUrl = await blobClient.generateSasUrl({
        permissions: "r", // read only
        expiresOn: expiresOn
      });

      console.log("URL SAS générée:", sasUrl);

      // Retourner l'état de la traduction et l'URL de téléchargement
      return NextResponse.json({
        status: translationStatus,
        downloadUrl: sasUrl,
        details: statusResponse.data
      });
    }

    // Sinon, retourner simplement l'état de la traduction
    return NextResponse.json({
      status: translationStatus,
      details: statusResponse.data
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'état de la traduction:', error);
    
    // Journaliser les détails de l'erreur
    if (error.response) {
      console.error('Statut de l\'erreur:', error.response.status);
      console.error('Headers de l\'erreur:', error.response.headers);
      console.error('Données de l\'erreur:', error.response.data);
    } else if (error.request) {
      console.error('Requête sans réponse:', error.request);
    } else {
      console.error('Message d\'erreur:', error.message);
    }
    
    // Vérifier si l'erreur est due à une réponse HTTP
    if (error.response) {
      return NextResponse.json({
        error: `Erreur lors de la vérification: ${error.response.status}`,
        details: error.response.data
      }, { status: error.response.status });
    }
    
    // Erreur générique
    return NextResponse.json({
      error: 'Erreur lors de la vérification de l\'état de la traduction',
      details: error.message
    }, { status: 500 });
  }
}