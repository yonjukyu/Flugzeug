// components/DocumentTranslator.jsx
import { useState, useEffect, useRef } from 'react';

export default function DocumentTranslator() {
  const [file, setFile] = useState(null);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('fr');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [translationStatus, setTranslationStatus] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [operationInfo, setOperationInfo] = useState(null);
  const statusCheckInterval = useRef(null);

  // Nettoyage des intervalles lors du démontage du composant
  useEffect(() => {
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const checkTranslationStatus = async () => {
    if (!operationInfo || !operationInfo.operationId) return;
  
    try {
      const response = await fetch('/api/check-translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operationId: operationInfo.operationId,
          targetBlobName: operationInfo.targetBlobName,
          containerName: operationInfo.containerName
        }),
      });
  
      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        console.error("Réponse non-JSON reçue:", textError);
        throw new Error(`Réponse serveur invalide (${response.status}): Attendu JSON, reçu ${contentType}`);
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || `Erreur lors de la vérification: ${response.status}`);
      }
  
      setTranslationStatus(data.status);
  
      if (data.status === 'Succeeded') {
        setDownloadUrl(data.downloadUrl);
        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
          statusCheckInterval.current = null;
        }
      } else if (data.status === 'Failed') {
        setError('La traduction a échoué. Veuillez réessayer.');
        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
          statusCheckInterval.current = null;
        }
      }
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'état:', err);
      setError(err.message);
      // Arrêter les vérifications en cas d'erreur répétée
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
        statusCheckInterval.current = null;
      }
    }
  };

// Dans votre composant DocumentTranslator.jsx, ajoutez une gestion d'erreur plus détaillée

// Modifiez la fonction handleSubmit avec cette gestion d'erreur améliorée
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  setTranslationStatus(null);
  setDownloadUrl(null);
  setOperationInfo(null);

  if (statusCheckInterval.current) {
    clearInterval(statusCheckInterval.current);
    statusCheckInterval.current = null;
  }

  if (!file) {
    setError('Veuillez sélectionner un fichier.');
    setIsLoading(false);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('sourceLanguage', sourceLanguage);
    formData.append('targetLanguage', targetLanguage);

    // Effectuer la requête
    const response = await fetch('/api/translate', {
      method: 'POST',
      body: formData,
    });

    // Vérifier le type de contenu de la réponse
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // Si la réponse n'est pas du JSON, récupérer le texte pour le déboguer
      const textError = await response.text();
      console.error("Réponse non-JSON reçue:", textError);
      throw new Error(`Réponse serveur invalide (${response.status}): Attendu JSON, reçu ${contentType}`);
    }

    // Maintenant, analyser la réponse JSON
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Erreur lors du lancement de la traduction: ${response.status}`);
    }

    setOperationInfo(data);
    setTranslationStatus('Running');

    // Vérifier l'état de la traduction toutes les 5 secondes
    statusCheckInterval.current = setInterval(checkTranslationStatus, 5000);
  } catch (err) {
    console.error("Erreur complète:", err);
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
  const getStatusText = () => {
    switch (translationStatus) {
      case 'NotStarted':
        return 'Traduction en attente de démarrage...';
      case 'Running':
        return 'Traduction en cours...';
      case 'Succeeded':
        return 'Traduction terminée avec succès!';
      case 'Failed':
        return 'La traduction a échoué.';
      case 'Cancelled':
        return 'La traduction a été annulée.';
      case 'Cancelling':
        return 'Annulation de la traduction en cours...';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Traducteur de Documents</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="file" className="block mb-2 font-medium">
            Sélectionner un document à traduire:
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="block w-full border border-gray-300 rounded p-2"
            accept=".docx,.pptx,.xlsx,.pdf,.html,.htm,.txt"
          />
          <p className="text-sm text-gray-500 mt-1">
            Formats supportés: DOCX, PPTX, XLSX, PDF, HTML, TXT
          </p>
          {file && (
            <p className="text-sm text-green-600 mt-1">
              Fichier sélectionné: {file.name}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="sourceLanguage" className="block mb-2 font-medium">
              Langue source:
            </label>
            <select
              id="sourceLanguage"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="auto">Détection automatique</option>
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="de">Allemand</option>
              <option value="es">Espagnol</option>
              <option value="it">Italien</option>
              <option value="ja">Japonais</option>
              <option value="ko">Coréen</option>
              <option value="pt">Portugais</option>
              <option value="ru">Russe</option>
              <option value="zh-Hans">Chinois simplifié</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="targetLanguage" className="block mb-2 font-medium">
              Langue cible:
            </label>
            <select
              id="targetLanguage"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="de">Allemand</option>
              <option value="es">Espagnol</option>
              <option value="it">Italien</option>
              <option value="ja">Japonais</option>
              <option value="ko">Coréen</option>
              <option value="pt">Portugais</option>
              <option value="ru">Russe</option>
              <option value="zh-Hans">Chinois simplifié</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading || !file || translationStatus === 'Running' || translationStatus === 'NotStarted'}
        >
          {isLoading ? 'Lancement de la traduction...' : 'Traduire le document'}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {translationStatus && (
        <div className={`mt-6 p-4 rounded ${
          translationStatus === 'Succeeded' ? 'bg-green-100 border border-green-400 text-green-700' :
          translationStatus === 'Failed' ? 'bg-red-100 border border-red-400 text-red-700' :
          'bg-blue-100 border border-blue-400 text-blue-700'
        }`}>
          <h2 className="text-xl font-bold mb-2">État de la traduction</h2>
          <p className="mb-2">{getStatusText()}</p>
          
          {translationStatus === 'Running' && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-blue-600 h-2.5 rounded-full w-3/4 animate-pulse"></div>
            </div>
          )}
        </div>
      )}
      
      {downloadUrl && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
          <h2 className="text-xl font-bold mb-2">Document traduit</h2>
          <p className="mb-4">Votre document traduit est prêt à être téléchargé.</p>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block"
          >
            Télécharger le document traduit
          </a>
          <p className="text-sm text-gray-500 mt-4">
            Note: Le lien de téléchargement expirera dans une heure.
          </p>
        </div>
      )}

{process.env.NODE_ENV !== 'production' && (
      <div className="mt-8 p-4 bg-gray-100 rounded border border-gray-300">
        <h3 className="text-lg font-bold mb-2">Informations de débogage</h3>
        
        <div className="mb-2">
          <strong>État de l'opération:</strong> {translationStatus || 'Non commencée'}
        </div>
        
        {operationInfo && (
          <div className="mb-2">
            <strong>ID d'opération:</strong>
            <div className="text-xs break-all bg-gray-200 p-2 my-1 rounded">
              {operationInfo.operationId || 'Non disponible'}
            </div>
            
            <strong>Nom du blob cible:</strong>
            <div className="text-xs break-all bg-gray-200 p-2 my-1 rounded">
              {operationInfo.targetBlobName || 'Non disponible'}
            </div>
            
            <strong>Nom du conteneur:</strong>
            <div className="text-xs break-all bg-gray-200 p-2 my-1 rounded">
              {operationInfo.containerName || 'Non disponible'}
            </div>
          </div>
        )}
        
        <div className="mt-3">
          <button 
            onClick={() => checkTranslationStatus()} 
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
            disabled={!operationInfo || !operationInfo.operationId}
          >
            Vérifier manuellement l'état
          </button>
        </div>
      </div>
    )}
    </div>
  );
}