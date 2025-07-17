'use client';
import { useState } from 'react';
import { HelpCircle, X, Lightbulb } from 'lucide-react';

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton d'aide */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Aide"
      >
        <HelpCircle size={24} />
      </button>

      {/* Modal d'aide */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Lightbulb className="text-yellow-500" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Guide d'utilisation</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Traduction de documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  📄 Traduction de Documents
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Étape 1 :</strong> Cliquez sur "Traduction de Documents" dans les onglets</p>
                  <p><strong>Étape 2 :</strong> Sélectionnez votre fichier (Word, PDF, TXT...)</p>
                  <p><strong>Étape 3 :</strong> Cliquez sur "Télécharger le document"</p>
                  <p><strong>Étape 4 :</strong> Une fois téléchargé, cliquez sur "Lancer la traduction"</p>
                  <p><strong>Étape 5 :</strong> Patientez quelques minutes et téléchargez votre document traduit</p>
                </div>
              </div>

              {/* Traduction d'images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  📷 Traduction d'Images (OCR)
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Étape 1 :</strong> Cliquez sur "Traduction d'Images (OCR)" dans les onglets</p>
                  <p><strong>Étape 2 :</strong> Choisissez votre langue de traduction dans la liste déroulante</p>
                  <p><strong>Étape 3 :</strong> Cliquez sur "Choisir une image" et sélectionnez votre photo</p>
                  <p><strong>Étape 4 :</strong> Cliquez sur "Extraire et Traduire le Texte"</p>
                  <p><strong>Étape 5 :</strong> Consultez le texte extrait et sa traduction</p>
                </div>
              </div>

              {/* Conseils */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  💡 Conseils pour de meilleurs résultats
                </h3>
                <div className="space-y-2 text-blue-700 text-sm">
                  <p>• <strong>Images :</strong> Utilisez des images nettes avec un texte bien visible</p>
                  <p>• <strong>Éclairage :</strong> Évitez les ombres et reflets sur le texte</p>
                  <p>• <strong>Contraste :</strong> Privilégiez un bon contraste entre le texte et l'arrière-plan</p>
                  <p>• <strong>Résolution :</strong> Les images haute résolution donnent de meilleurs résultats</p>
                  <p>• <strong>Langues :</strong> L'outil détecte automatiquement la langue source</p>
                </div>
              </div>

              {/* Formats supportés */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Documents supportés</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Word (.docx)</li>
                    <li>• PDF (.pdf)</li>
                    <li>• Texte (.txt)</li>
                    <li>• Et autres formats</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Images supportées</h4>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• JPEG (.jpg, .jpeg)</li>
                    <li>• PNG (.png)</li>
                    <li>• GIF (.gif)</li>
                    <li>• WebP (.webp)</li>
                  </ul>
                </div>
              </div>

              {/* Limitations */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                  ⚠️ Limitations à connaître
                </h3>
                <div className="space-y-1 text-yellow-700 text-sm">
                  <p>• Taille maximale des fichiers : 50 MB</p>
                  <p>• La qualité de l'OCR dépend de la netteté de l'image</p>
                  <p>• Certains caractères spéciaux peuvent ne pas être reconnus</p>
                  <p>• Le traitement peut prendre quelques secondes à quelques minutes</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
