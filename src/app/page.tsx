// app/page.jsx ou app/page.js (selon que vous utilisiez TypeScript ou non)
"use client"; // Important pour utiliser des hooks React

import TranslationForm from "./components/TranslationForm.js";

export default function Home() {
	return (
		<main className="min-h-screen p-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold mb-6 text-center">
					Flugzeug Document Translation
				</h1>
				<TranslationForm />
			</div>
		</main>
	);
}
