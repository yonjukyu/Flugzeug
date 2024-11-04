// src/services/TranslationService.ts
import path from "path";
import fs from "fs";
import pdf from 'pdf-parse'
import axios from "axios";
import PDFDocument from "pdfkit";

export class TranslationService {
    private readonly SUPPORTED_LANGUAGES = [
        'en', 'ar', 'zh', 'nl', 'fi', 'fr', 'de', 'hi',
        'hu', 'id', 'ga', 'it', 'ja', 'ko', 'pl', 'pt',
        'ru', 'es', 'sv', 'tr', 'uk', 'vi'
    ];

    // URL de l'API LibreTranslate - vous pouvez héberger votre propre instance ou utiliser une instance publique
    private readonly LIBRE_TRANSLATE_URL = 'https://libretranslate.de';

    public async translatePDF(
        base64File: string,
        sourceLanguage: string,
        targetLanguage: string
    ): Promise<string> {
        const sourceLower = sourceLanguage.toLowerCase();
        const targetLower = targetLanguage.toLowerCase();

        this.validateLanguages(sourceLower, targetLower);

        const inputFilePath = this.base64ToFile(base64File);

        try {
            // Extraire le texte du PDF
            const pdfText = await this.parsePDF(inputFilePath);

            // Traduire le texte
            const translatedText = await this.translateText(pdfText, sourceLower, targetLower);

            // Générer un nouveau PDF avec le texte traduit
            const outputFilePath = await this.generatePDF(translatedText);

            // Convertir le nouveau PDF en base64
            return this.fileToBase64(outputFilePath);
        }
        catch (e){
            console.error('Erreur lors de la traduction:', e);
            return "fea";
        }
            finally
         {
            // Nettoyage des fichiers temporaires
            if (fs.existsSync(inputFilePath)) {
                fs.unlinkSync(inputFilePath);
            }
        }
    }

    private validateLanguages(source: string, target: string): void {
        if (!this.SUPPORTED_LANGUAGES.includes(source) || !this.SUPPORTED_LANGUAGES.includes(target)) {
            throw new Error(`Langues non supportées. Langues supportées: ${this.SUPPORTED_LANGUAGES.join(', ')}`);
        }
    }

    private base64ToFile(base64String: string, ext: string = 'pdf'): string {
        const base64Data = base64String.replace(/^data:application\/pdf;base64,/, '');
        const fileName = `temp-${Date.now()}.${ext}`;
        const tempDir = path.join(process.cwd(), 'temp');
        const filePath = path.join(tempDir, fileName);

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        fs.writeFileSync(filePath, base64Data, 'base64');
        return filePath;
    }

    private fileToBase64(filePath: string): string {
        const fileData = fs.readFileSync(filePath);
        const base64Data = fileData.toString('base64');
        fs.unlinkSync(filePath); // Nettoyer le fichier après conversion
        return `data:application/pdf;base64,${base64Data}`;
    }

    private async parsePDF(filePath: string): Promise<string> {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    }

    private async translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
        try {
            const response = await axios.post(`${this.LIBRE_TRANSLATE_URL}/translate`, {
                q: text,
                source: sourceLang,
                target: targetLang,
                format: "text"
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data.translatedText;
        } catch (error) {
            console.error('Erreur de traduction:', error);
            throw new Error('Erreur lors de la traduction du texte');
        }
    }

    private async generatePDF(text: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(process.cwd(), 'temp', `output-${Date.now()}.pdf`);
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(outputPath);

            // Gérer les événements de stream
            stream.on('finish', () => resolve(outputPath));
            stream.on('error', reject);

            // Configurer le document
            doc.pipe(stream);

            // Ajouter le texte traduit avec mise en forme
            doc.fontSize(12);

            // Diviser le texte en paragraphes et les ajouter
            const paragraphs = text.split('\n\n');
            let y = 50;

            paragraphs.forEach((paragraph) => {
                if (y > 700) { // Nouvelle page si près du bas
                    doc.addPage();
                    y = 50;
                }

                doc.text(paragraph, 50, y, {
                    width: 500,
                    align: 'justify'
                });

                y += doc.heightOfString(paragraph, { width: 500 }) + 20;
            });

            doc.end();
        });
    }
}