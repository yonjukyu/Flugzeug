'use client';
import { Camera, Copy, Download, Eye, EyeOff, RefreshCw, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';

export default function ImageTranslatorTesseract() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('fr');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [showPreprocessed, setShowPreprocessed] = useState(false);
  const [preprocessedImage, setPreprocessedImage] = useState(null);
  const [notification, setNotification] = useState('');
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'Anglais' },
    { code: 'es', name: 'Espagnol' },
    { code: 'de', name: 'Allemand' },
    { code: 'it', name: 'Italien' },
    { code: 'pt', name: 'Portugais' },
    { code: 'ar', name: 'Arabe' },
    { code: 'zh', name: 'Chinois' },
    { code: 'ja', name: 'Japonais' },
    { code: 'ko', name: 'Coréen' },
    { code: 'ru', name: 'Russe' }
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      setSelectedImage(file);
      setError('');
      setOriginalText('');
      setTranslatedText('');
      setOcrProgress(0);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const preprocessImage = (imageData) => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Redimensionner si nécessaire
        let { width, height } = img;
        const maxSize = 1200;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Améliorer le contraste
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Convertir en niveaux de gris
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Augmenter le contraste
          const contrast = 1.5;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          const newGray = factor * (gray - 128) + 128;
          
          // Seuillage pour binariser
          const threshold = 127;
          const binaryValue = newGray > threshold ? 255 : 0;
          
          data[i] = data[i + 1] = data[i + 2] = binaryValue;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Sauvegarder l'image préprocessée
        const preprocessedDataUrl = canvas.toDataURL('image/png');
        setPreprocessedImage(preprocessedDataUrl);
        
        resolve(preprocessedDataUrl);
      };
      
      img.src = imageData;
    });
  };

  const performOCR = async (imageData) => {
    const worker = await createWorker('fra+eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          setOcrProgress(Math.round(m.progress * 100));
        }
      }
    });

    try {
      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();
      return text;
    } catch (error) {
      await worker.terminate();
      throw error;
    }
  };

  const translateText = async (text) => {
    const response = await fetch('/api/image-translate-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        targetLanguage: targetLanguage
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la traduction');
    }

    return response.json();
  };

  const handleProcess = async () => {
    if (!selectedImage) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setIsProcessing(true);
    setError('');
    setOriginalText('');
    setTranslatedText('');
    setOcrProgress(0);

    try {
      // Étape 1: Préprocessing de l'image
      console.log('Préprocessing de l\'image...');
      const preprocessedImageData = await preprocessImage(imagePreview);

      // Étape 2: OCR avec Tesseract.js
      console.log('Extraction du texte...');
      const extractedText = await performOCR(preprocessedImageData);
      
      if (!extractedText.trim()) {
        setOriginalText('');
        setTranslatedText('Aucun texte détecté dans l\'image');
        return;
      }

      setOriginalText(extractedText.trim());

      // Étape 3: Traduction
      console.log('Traduction du texte...');
      const translationData = await translateText(extractedText.trim());
      setTranslatedText(translationData.translatedText);

    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setNotification('Texte copié dans le presse-papiers !');
      setTimeout(() => setNotification(''), 3000);
    });
  };

  const downloadText = (text, filename) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setOriginalText('');
    setTranslatedText('');
    setError('');
    setOcrProgress(0);
    setPreprocessedImage(null);
    setNotification('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg space-y-6">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Traduction d&apos;Images avec OCR Local
        </h2>
        <p className="text-gray-600 mb-3">
          Extraction de texte et traduction directement dans votre navigateur
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          <p className="flex font-medium">🚀 Avantages de cette solution :</p>
          <ul className="mt-1 text-left list-disc list-inside space-y-1">
            <li>OCR 100% local (confidentialité maximale)</li>
            <li>Aucune limite d&apos;utilisation</li>
            <li>Fonctionne hors ligne pour l&apos;OCR</li>
            <li>Traitement d&apos;image optimisé automatiquement</li>
          </ul>
        </div>
      </div>

      {/* Sélection de la langue cible */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Langue de traduction
        </label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isProcessing}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Zone de upload d'image */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={isProcessing}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            <Upload size={20} />
            <span>Choisir une image</span>
          </button>
          
          {selectedImage && !isProcessing && (
            <button
              onClick={resetForm}
              className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              <RefreshCw size={20} />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>

        {/* Aperçu de l'image */}
        {imagePreview && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">
                Fichier sélectionné: {selectedImage?.name}
              </p>
              {preprocessedImage && (
                <button
                  onClick={() => setShowPreprocessed(!showPreprocessed)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  {showPreprocessed ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showPreprocessed ? 'Image originale' : 'Image traitée'}</span>
                </button>
              )}
            </div>
            <img
              src={showPreprocessed && preprocessedImage ? preprocessedImage : imagePreview}
              alt="Aperçu"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
            />
          </div>
        )}
      </div>

      {/* Bouton de traitement */}
      <button
        onClick={handleProcess}
        disabled={!selectedImage || isProcessing}
        className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
          !selectedImage || isProcessing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>
              {ocrProgress > 0 ? `Extraction: ${ocrProgress}%` : 'Traitement...'}
            </span>
          </>
        ) : (
          <>
            <Camera size={20} />
            <span>Extraire et Traduire le Texte</span>
          </>
        )}
      </button>

      {/* Barre de progression */}
      {isProcessing && ocrProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${ocrProgress}%` }}
          ></div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-600">{notification}</p>
        </div>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Résultats */}
      {(originalText || translatedText) && (
        <div className="space-y-4">
          {/* Texte original */}
          {originalText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Texte extrait
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(originalText)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copier"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => downloadText(originalText, 'texte-original.txt')}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Télécharger"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{originalText}</p>
              </div>
            </div>
          )}

          {/* Texte traduit */}
          {translatedText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Traduction ({languages.find(l => l.code === targetLanguage)?.name})
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(translatedText)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copier"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => downloadText(translatedText, 'texte-traduit.txt')}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Télécharger"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{translatedText}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
