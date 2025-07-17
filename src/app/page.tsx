"use client";

import { useState } from "react";
import TranslationForm from "./components/TranslationForm.js";
import ImageTranslatorChoice from "./components/ImageTranslatorChoice.js";
import HelpModal from "./components/HelpModal.js";
import { FileText, Camera } from "lucide-react";

export default function Home() {
	const [activeTab, setActiveTab] = useState('documents');

	return (
		<main className="min-h-screen bg-gray-50 p-4">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-4 text-gray-800">
						Flugzeug Translation Hub
					</h1>
					<p className="text-xl text-gray-600">
						Traduisez vos documents et images en temps réel avec l'IA
					</p>
				</div>

				{/* Onglets de navigation */}
				<div className="bg-white rounded-lg shadow-sm mb-6">
					<div className="flex border-b border-gray-200">
						<button
							onClick={() => setActiveTab('documents')}
							className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
								activeTab === 'documents'
									? 'border-b-2 border-blue-500 text-blue-600'
									: 'text-gray-500 hover:text-gray-700'
							}`}
						>
							<FileText size={20} />
							<span>Traduction de Documents</span>
						</button>
						
						<button
							onClick={() => setActiveTab('images')}
							className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
								activeTab === 'images'
									? 'border-b-2 border-blue-500 text-blue-600'
									: 'text-gray-500 hover:text-gray-700'
							}`}
						>
							<Camera size={20} />
							<span>Traduction d'Images (OCR)</span>
						</button>
					</div>
				</div>

				{/* Contenu des onglets */}
				<div className="bg-white rounded-lg shadow-sm">
					{activeTab === 'documents' && (
						<div className="p-6">
							<div className="mb-4">
								<h2 className="text-2xl font-bold text-gray-800 mb-2">
									Traduction de Documents
								</h2>
								<p className="text-gray-600">
									Téléchargez vos documents Word, PDF ou autres formats pour une traduction complète
								</p>
							</div>
							<TranslationForm />
						</div>
					)}
					
					{activeTab === 'images' && (
						<div className="p-6">
							<ImageTranslatorChoice />
						</div>
					)}
				</div>

				{/* Informations supplémentaires */}
				<div className="mt-8 grid md:grid-cols-2 gap-6">
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold text-gray-800 mb-3">
							Formats supportés - Documents
						</h3>
						<ul className="text-gray-600 space-y-1">
							<li>• Documents Word (.docx)</li>
							<li>• Fichiers PDF</li>
							<li>• Documents texte (.txt)</li>
							<li>• Et bien d'autres formats</li>
						</ul>
					</div>
					
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold text-gray-800 mb-3">
							Formats supportés - Images
						</h3>
						<ul className="text-gray-600 space-y-1">
							<li>• Images JPEG/JPG</li>
							<li>• Images PNG</li>
							<li>• Images GIF</li>
							<li>• Images WebP</li>
						</ul>
					</div>
				</div>

				{/* Bouton d'aide flottant */}
				<HelpModal />
			</div>
		</main>
	);
}
