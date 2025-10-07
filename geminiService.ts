import { GoogleGenAI, Modality } from "@google/genai";
import { ReferenceImage } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set. Please add it to your .env.local file.");
}

const ai = new GoogleGenAI({ apiKey });

const dataUrlToBlob = (dataUrl: string): { data: string, mimeType: string } => {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return { data, mimeType };
};

export async function editImageWithMask(
  baseImage: string,
  maskImage: string,
  prompt: string,
  objectImages: ReferenceImage[]
): Promise<{ image: string | null; text: string | null }> {
    try {
        const baseImageBlob = dataUrlToBlob(baseImage);
        const maskImageBlob = dataUrlToBlob(maskImage);

        const objectImageParts = objectImages.map(img => {
            const blob = dataUrlToBlob(img.url);
            return {
                inlineData: {
                    data: blob.data,
                    mimeType: blob.mimeType,
                },
            };
        });

        const parts = [
            { text: prompt },
            {
                inlineData: {
                    data: baseImageBlob.data,
                    mimeType: baseImageBlob.mimeType,
                },
            },
            ...objectImageParts,
            {
                inlineData: {
                    data: maskImageBlob.data,
                    mimeType: maskImageBlob.mimeType,
                },
            },
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let newImage: string | null = null;
        let newText: string | null = null;
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              newImage = part.inlineData.data;
            }
            if (part.text) {
              newText = part.text;
            }
        }

        if (!newImage) {
            throw new Error("API did not return an image.");
        }
        
        return { image: newImage, text: newText };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if(error instanceof Error) {
            throw new Error(`Failed to generate image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the image.");
    }
}