// app/api/image-translate-simple/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const body = await req.json();
    const { text, targetLanguage = 'fr' } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Aucun texte fourni' }, { status: 400 });
    }

    // Vérifier les variables d'environnement
    if (!process.env.AZURE_TRANSLATION_KEY) {
      console.error('Clé de traduction Azure manquante');
      return NextResponse.json({ 
        error: 'Configuration Azure manquante. Vérifiez votre clé de traduction.' 
      }, { status: 500 });
    }

    console.log('Traduction du texte:', text.substring(0, 100) + '...');
    console.log('Langue cible:', targetLanguage);

    // Traduction avec Azure Translator
    const translatorEndpoint = 'https://api.cognitive.microsofttranslator.com/translate';
    
    const translationResponse = await axios.post(
      `${translatorEndpoint}?api-version=3.0&to=${targetLanguage}`,
      [{ text: text }],
      {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATION_KEY,
          'Ocp-Apim-Subscription-Region': process.env.AZURE_TRANSLATOR_REGION || 'francecentral',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Traduction réussie');

    const translation = translationResponse.data[0];
    const translatedText = translation.translations[0].text;
    const detectedLanguage = translation.detectedLanguage?.language || 'unknown';

    return NextResponse.json({
      originalText: text,
      translatedText: translatedText,
      language: detectedLanguage,
      confidence: translation.detectedLanguage?.score || 0
    });

  } catch (error) {
    console.error('Erreur détaillée:', error);
    
    let errorMessage = 'Erreur lors de la traduction';
    let errorDetails = {};
    
    if (error.response) {
      errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
      errorMessage += `: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    console.error('Error details:', errorDetails);

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
