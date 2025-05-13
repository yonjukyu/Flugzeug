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
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-xl font-bold">Traduction de documents</h1>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Sélectionner un document
        </label>
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
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handleUpload}
          disabled={isLoading || !file}
          className={`flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 
                    disabled:bg-gray-300 disabled:cursor-not-allowed
                    flex items-center justify-center`}
        >
          {isLoading ? 
            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : 
            null
          }
          Télécharger
        </button>
        
        <button
          onClick={handleTranslate}
          disabled={isLoading || !filename}
          className={`flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 
                    disabled:bg-gray-300 disabled:cursor-not-allowed
                    flex items-center justify-center`}
        >
          {isLoading ? 
            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : 
            null
          }
          Traduire
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {status && <p className="text-blue-600">{status}</p>}
      
      {translatedUrl && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-semibold">Document traduit</p>
          <a 
            href={translatedUrl} 
            target="_blank" 
            rel="noreferrer"
            className="text-blue-600 hover:underline flex items-center mt-1"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Télécharger le document traduit
          </a>
        </div>
      )}
    </div>
  );
}