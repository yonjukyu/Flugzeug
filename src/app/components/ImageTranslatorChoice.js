'use client';
import { useState } from 'react';
import ImageTranslatorTesseract from './ImageTranslatorTesseract.js';
import ImageTranslator from './ImageTranslator.js';
import { Settings, Zap, Cloud } from 'lucide-react';

export default function ImageTranslatorChoice() {
  const [ocrMethod, setOcrMethod] = useState('tesseract'); // 'tesseract' ou 'azure'

  return (
    <div className="space-y-6">
      {/* Sélecteur de méthode OCR */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Settings size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Méthode d'extraction de texte</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setOcrMethod('tesseract')}
            className={`p-4 rounded-lg border-2 transition-all ${
              ocrMethod === 'tesseract'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Zap size={24} className={ocrMethod === 'tesseract' ? 'text-blue-600' : 'text-gray-500'} />
              <div className="text-left">
                <h4 className={`font-medium ${ocrMethod === 'tesseract' ? 'text-blue-800' : 'text-gray-700'}`}>
                  OCR Local (Tesseract)
                </h4>
                <p className="text-sm text-gray-600">Rapide • Privé • Illimité</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setOcrMethod('azure')}
            className={`p-4 rounded-lg border-2 transition-all ${
              ocrMethod === 'azure'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Cloud size={24} className={ocrMethod === 'azure' ? 'text-green-600' : 'text-gray-500'} />
              <div className="text-left">
                <h4 className={`font-medium ${ocrMethod === 'azure' ? 'text-green-800' : 'text-gray-700'}`}>
                  OCR Azure (Cloud)
                </h4>
                <p className="text-sm text-gray-600">Précis • Professionnel • Requis config</p>
              </div>
            </div>
          </button>
        </div>
        
        {/* Information sur la méthode sélectionnée */}
        <div className="mt-3 p-3 bg-white rounded border">
          {ocrMethod === 'tesseract' ? (
            <div className="text-sm text-gray-600">
              <p className="font-medium text-blue-700 mb-1">OCR Local (Recommandé) :</p>
              <p>• Traitement 100% dans votre navigateur</p>
              <p>• Confidentialité maximale (aucune donnée envoyée)</p>
              <p>• Fonctionne sans configuration Azure</p>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <p className="font-medium text-green-700 mb-1">OCR Azure Cloud :</p>
              <p>• Précision supérieure pour les textes complexes</p>
              <p>• Nécessite une clé Azure Computer Vision valide</p>
              <p>• Consommation de crédits Azure par utilisation</p>
            </div>
          )}
        </div>
      </div>

      {/* Composant de traduction selon la méthode choisie */}
      {ocrMethod === 'tesseract' ? (
        <ImageTranslatorTesseract />
      ) : (
        <ImageTranslator />
      )}
    </div>
  );
}
