'use client';
import { Camera, Copy, Download, RefreshCw, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

export default function ImageTranslator() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('fr');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [confidence, setConfidence] = useState(0);
  
  const fileInputRef = useRef(null);

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
      setDetectedLanguage('');
      setConfidence(0);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTranslate = async () => {
    if (!selectedImage) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setIsLoading(true);
    setError('');
    setOriginalText('');
    setTranslatedText('');

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('targetLanguage', targetLanguage);

      const response = await fetch('/api/image-translate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la traduction');
      }

      const data = await response.json();
      setOriginalText(data.originalText);
      setTranslatedText(data.translatedText);
      setDetectedLanguage(data.language);
      setConfidence(data.confidence);

    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Vous pourriez ajouter une notification ici
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
    setDetectedLanguage('');
    setConfidence(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Traduction d&apos;Images avec OCR
        </h2>
        <p className="text-gray-600">
          Déposez une image contenant du texte pour la traduire instantanément
        </p>
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
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Upload size={20} />
            <span>Choisir une image</span>
          </button>
          
          {selectedImage && (
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
            <img
              src={imagePreview}
              alt="Aperçu"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-500 text-center mt-2">
              Fichier sélectionné: {selectedImage?.name}
            </p>
          </div>
        )}
      </div>

      {/* Bouton de traduction */}
      <button
        onClick={handleTranslate}
        disabled={!selectedImage || isLoading}
        className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
          !selectedImage || isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Traduction en cours...</span>
          </>
        ) : (
          <>
            <Camera size={20} />
            <span>Extraire et Traduire le Texte</span>
          </>
        )}
      </button>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Résultats */}
      {(originalText || translatedText) && (
        <div className="space-y-4">
          {/* Informations sur la détection */}
          {detectedLanguage && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-700">
                <strong>Langue détectée:</strong> {detectedLanguage}
                {confidence > 0 && (
                  <span className="ml-2">
                    (Confiance: {Math.round(confidence * 100)}%)
                  </span>
                )}
              </p>
            </div>
          )}

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
