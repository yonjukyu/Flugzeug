// app/api/image-translate/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const targetLanguage = formData.get('targetLanguage') || 'fr';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 });
    }

    // Vérifier les variables d'environnement
    if (!process.env.AZURE_TRANSLATION_ENDPOINT || !process.env.AZURE_TRANSLATION_KEY) {
      console.error('Variables d\'environnement manquantes:', {
        endpoint: !!process.env.AZURE_TRANSLATION_ENDPOINT,
        key: !!process.env.AZURE_TRANSLATION_KEY
      });
      return NextResponse.json({ 
        error: 'Configuration Azure manquante. Vérifiez vos variables d\'environnement.' 
      }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Étape 1: OCR avec Azure Computer Vision
    // Construire l'endpoint correct pour Computer Vision
    let ocrEndpoint;
    if (process.env.AZURE_TRANSLATION_ENDPOINT.includes('cognitiveservices.azure.com')) {
      // Service multi-service (Cognitive Services)
      ocrEndpoint = process.env.AZURE_TRANSLATION_ENDPOINT + 'vision/v3.2/read/analyze';
    } else {
      // Service Computer Vision dédié
      ocrEndpoint = process.env.AZURE_TRANSLATION_ENDPOINT.replace('//', '//vision-') + 'vision/v3.2/read/analyze';
    }
    
    // S'assurer que l'endpoint finit par '/'
    if (!process.env.AZURE_TRANSLATION_ENDPOINT.endsWith('/')) {
      ocrEndpoint = ocrEndpoint.replace('/vision/', '/vision/');
    }
    
    console.log('OCR Endpoint:', ocrEndpoint);

    const ocrResponse = await axios.post(ocrEndpoint, buffer, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATION_KEY,
        'Content-Type': 'application/octet-stream'
      }
    });

    // Récupérer l'URL de résultat depuis les headers
    const operationLocation = ocrResponse.headers['operation-location'];
    if (!operationLocation) {
      throw new Error('Pas d\'URL d\'opération reçue de l\'OCR');
    }

    // Attendre les résultats de l'OCR
    let ocrResult;
    let attempts = 0;
    const maxAttempts = 30;

    do {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
      attempts++;
      
      const resultResponse = await axios.get(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATION_KEY
        }
      });

      ocrResult = resultResponse.data;
    } while (ocrResult.status === 'running' && attempts < maxAttempts);

    if (ocrResult.status !== 'succeeded') {
      throw new Error('L\'OCR a échoué ou a pris trop de temps');
    }

    // Extraire le texte des résultats OCR
    const extractedText = [];
    if (ocrResult.analyzeResult && ocrResult.analyzeResult.readResults) {
      ocrResult.analyzeResult.readResults.forEach(page => {
        page.lines.forEach(line => {
          extractedText.push(line.text);
        });
      });
    }

    const fullText = extractedText.join('\n');

    if (!fullText.trim()) {
      return NextResponse.json({ 
        originalText: '', 
        translatedText: 'Aucun texte détecté dans l\'image',
        language: 'unknown'
      });
    }

    // Étape 2: Traduction avec Azure Translator
    const translatorEndpoint = 'https://api.cognitive.microsofttranslator.com/translate';
    
    const translationResponse = await axios.post(
      `${translatorEndpoint}?api-version=3.0&to=${targetLanguage}`,
      [{ text: fullText }],
      {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATION_KEY,
          'Ocp-Apim-Subscription-Region': process.env.AZURE_TRANSLATOR_REGION || 'francecentral',
          'Content-Type': 'application/json'
        }
      }
    );

    const translation = translationResponse.data[0];
    const translatedText = translation.translations[0].text;
    const detectedLanguage = translation.detectedLanguage?.language || 'unknown';

    return NextResponse.json({
      originalText: fullText,
      translatedText: translatedText,
      language: detectedLanguage,
      confidence: translation.detectedLanguage?.score || 0
    });

  } catch (error) {
    console.error('Erreur lors de la traduction d\'image:', error);
    
    let errorMessage = 'Erreur lors de la traduction d\'image';
    if (error.response) {
      errorMessage += `: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
