// Améliorations du composant TranslateForm
// components/TranslateForm.js
'use client';
import { useState } from 'react';

export default function TranslateForm() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [translatedUrl, setTranslatedUrl] = useState(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const data = await res.json();
      setFilename(data.filename);
      setStatus('✅ Fichier téléchargé avec succès');
    } catch (error) {
      setError(`Erreur: ${error.message}`);
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!filename) {
      setError('Veuillez d\'abord télécharger un fichier');
      return;
    }

    setIsLoading(true);
    setError('');
    setStatus('🔄 Traduction en cours...');
    
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la traduction');
      }

      const data = await res.json();
      
      if (data.success) {
        setStatus('✅ Traduction terminée');
        const translated = data.results.find(doc => doc.status === 'Succeeded');
        if (translated) {
          setTranslatedUrl(translated.translatedUrl);
        } else {
          setStatus('⏳ Traduction en attente, veuillez vérifier ultérieurement');
        }
      } else {
        throw new Error('La traduction a échoué');
      }
    } catch (error) {
      setError(`Erreur: ${error.message}`);
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Section Upload */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sélectionner un document
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input 
                type="file" 
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                Formats supportés: Word, PDF, TXT, etc.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={isLoading || !file}
            className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 
                      disabled:bg-gray-300 disabled:cursor-not-allowed
                      flex items-center justify-center font-medium transition-colors`}
          >
            {isLoading ? 
              <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : 
              null
            }
            Télécharger le document
          </button>
        </div>

        {/* Section Traduction */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">État du traitement</h3>
            {!filename && (
              <p className="text-sm text-gray-500">En attente d'un document...</p>
            )}
            {filename && !translatedUrl && (
              <p className="text-sm text-blue-600">Document téléchargé: {filename}</p>
            )}
            {status && <p className="text-sm text-blue-600">{status}</p>}
          </div>
          
          <button
            onClick={handleTranslate}
            disabled={isLoading || !filename}
            className={`w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 
                      disabled:bg-gray-300 disabled:cursor-not-allowed
                      flex items-center justify-center font-medium transition-colors`}
          >
            {isLoading ? 
              <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : 
              null
            }
            Lancer la traduction
          </button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {/* Résultat de traduction */}
      {translatedUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800">Document traduit</h3>
            <div className="flex items-center text-green-600">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-sm font-medium">Traduction terminée</span>
            </div>
          </div>
          <a 
            href={translatedUrl} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Télécharger le document traduit
          </a>
        </div>
      )}
    </div>
  );
}