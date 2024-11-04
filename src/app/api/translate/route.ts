import {NextResponse} from "next/server";
import {TranslationService} from "@/app/services/translation/translationService";

export async function POST(request: Request) {
    try {
        console.debug('Requête ');
        // Assurez-vous d'attendre la résolution de request.json()
        const body = await request.json();
        console.debug('Requête de traduction:', body);

        const { base64File, sourceLanguage, targetLanguage } = body;

        // Validation des entrées
        if (!base64File || !sourceLanguage || !targetLanguage) {
            return NextResponse.json({
                message: 'Paramètres manquants',
                requiredFields: ['base64File', 'sourceLanguage', 'targetLanguage']
            }, { status: 400 });
        }

        const translationService = new TranslationService();
        const translatedPDFBase64 = await translationService.translatePDF(
            base64File,
            sourceLanguage,
            targetLanguage
        );

        return NextResponse.json({
            translatedFile: translatedPDFBase64,
            sourceLanguage: sourceLanguage.toLowerCase(),
            targetLanguage: targetLanguage.toLowerCase()
        });

    } catch (error) {
        console.error('Erreur de traduction:', error);
        return NextResponse.json({
            message: 'Erreur lors de la traduction du document',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        }, { status: 500 });
    }
}
