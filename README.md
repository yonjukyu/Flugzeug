# Flugzeug Translation Hub 🚁

Un hub de traduction complet utilisant l'IA d'Azure pour traduire des documents et des images en temps réel.

## 🚀 Fonctionnalités

### Traduction de Documents
- Upload et traduction automatique de documents (Word, PDF, TXT, etc.)
- Stockage sécurisé dans Azure Blob Storage
- Interface utilisateur intuitive avec suivi du statut

### Traduction d'Images avec OCR
- **Nouvelle fonctionnalité** : Extraction de texte à partir d'images
- OCR (Reconnaissance Optique de Caractères) avec Azure Computer Vision
- Traduction instantanée du texte extrait
- Support de multiples langues (Français, Anglais, Espagnol, Allemand, etc.)
- Aperçu en temps réel des images
- Fonctions de copie et téléchargement des résultats

## 🛠️ Technologies Utilisées

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **IA et Cloud**: 
  - Azure Computer Vision (OCR)
  - Azure Translator (Traduction)
  - Azure Blob Storage (Stockage)
- **UI**: Lucide React (icônes), composants personnalisés

## 📋 Prérequis

- Node.js 18+ 
- Compte Azure avec les services suivants :
  - Azure Computer Vision
  - Azure Translator
  - Azure Blob Storage

## ⚙️ Configuration

1. **Cloner le projet**
```bash
git clone <your-repo>
cd flugzeug
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**

Copiez `.env.example` vers `.env.local` et configurez vos clés Azure :

```bash
# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key
SOURCE_CONTAINER=your_source_container
TARGET_CONTAINER=your_target_container

# Azure Services pour traduction et OCR
AZURE_TRANSLATION_ENDPOINT=https://your-region.cognitiveservices.azure.com/
AZURE_TRANSLATION_KEY=your_translation_key
AZURE_TRANSLATOR_REGION=your_region
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🎯 Utilisation

### Traduction de Documents
1. Accédez à l'onglet "Traduction de Documents"
2. Sélectionnez votre fichier (Word, PDF, TXT, etc.)
3. Cliquez sur "Télécharger le document"
4. Lancez la traduction avec "Lancer la traduction"
5. Téléchargez le document traduit une fois prêt

### Traduction d'Images (OCR)
1. Accédez à l'onglet "Traduction d'Images (OCR)"
2. Choisissez votre langue de traduction cible
3. Sélectionnez une image contenant du texte
4. Cliquez sur "Extraire et Traduire le Texte"
5. Consultez le texte extrait et sa traduction
6. Utilisez les boutons pour copier ou télécharger les résultats

## 📁 Structure du Projet

```
src/
├── app/
│   ├── api/
│   │   ├── upload/          # Upload de documents
│   │   ├── translate/       # Traduction de documents
│   │   └── image-translate/ # OCR + traduction d'images
│   ├── components/
│   │   ├── TranslationForm.js    # Composant traduction documents
│   │   └── ImageTranslator.js    # Composant traduction images
│   ├── layout.tsx
│   └── page.tsx             # Page principale avec onglets
├── lib/
│   ├── azure-storage-utils.js
│   └── azure-utils.js
```

## 🔧 APIs Disponibles

### POST `/api/image-translate`
Extrait le texte d'une image et le traduit.

**Paramètres** :
- `file` : Image (JPEG, PNG, GIF, WebP)
- `targetLanguage` : Code de langue cible (fr, en, es, de, etc.)

**Réponse** :
```json
{
  "originalText": "Texte extrait",
  "translatedText": "Texte traduit",
  "language": "en",
  "confidence": 0.95
}
```

### POST `/api/upload`
Upload un document vers Azure Blob Storage.

### POST `/api/translate`
Lance la traduction d'un document.

## 🌍 Langues Supportées

- Français (fr)
- Anglais (en)
- Espagnol (es)
- Allemand (de)
- Italien (it)
- Portugais (pt)
- Arabe (ar)
- Chinois (zh)
- Japonais (ja)
- Coréen (ko)
- Russe (ru)

## 🚀 Déploiement

Le plus simple est d'utiliser [Vercel](https://vercel.com) :

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement dans le dashboard Vercel
3. Déployez automatiquement

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 💡 Fonctionnalités Futures

- [ ] Support de plus de formats d'images
- [ ] Traduction de vidéos avec sous-titres
- [ ] Interface d'administration
- [ ] API publique avec authentification
- [ ] Support de la traduction en temps réel via webcam
- [ ] Historique des traductions
