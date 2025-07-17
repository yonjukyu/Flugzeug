"use client";

import { Camera, FileText } from "lucide-react";
import { useState } from "react";
import HelpModal from "./components/HelpModal.js";
import ImageTranslatorChoice from "./components/ImageTranslatorChoice.js";
import TranslationForm from "./components/TranslationForm.js";

export default function Home() {
	const [activeTab, setActiveTab] = useState("documents");

	return (
		<main className="min-h-screen bg-gray-50 py-8 px-4">
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
							onClick={() => setActiveTab("documents")}
							className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
								activeTab === "documents"
									? "border-b-2 border-blue-500 text-blue-600"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							<FileText size={20} />
							<span>Traduction de Documents</span>
						</button>

						<button
							onClick={() => setActiveTab("images")}
							className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
								activeTab === "images"
									? "border-b-2 border-blue-500 text-blue-600"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							<Camera size={20} />
							<span>Traduction d'Images (OCR)</span>
						</button>
					</div>
				</div>

				{/* Contenu des onglets */}
				<div className="bg-white rounded-lg shadow-sm">
					{activeTab === "documents" && (
						<div className="p-6">
							<div className="mb-4">
								<h2 className="text-2xl font-bold text-gray-800 mb-2">
									Traduction de Documents
								</h2>
								<p className="text-gray-600">
									Téléchargez vos documents Word, PDF ou autres formats pour une
									traduction complète
								</p>
							</div>
							<TranslationForm />
						</div>
					)}

					{activeTab === "images" && (
						<div className="p-6">
							<ImageTranslatorChoice />
						</div>
					)}
				</div>

				{/* Bouton d'aide flottant */}
				<HelpModal />
			</div>
		</main>
	);
}
