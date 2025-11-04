
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LearningMaterial, Flashcard, ChatMessage, MCQ } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const textModel = 'gemini-2.5-flash';
const imageModel = 'gemini-2.5-flash-image';


const generateWithSchema = async <T,>(prompt: string, schema: any): Promise<T> => {
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as T;
    } catch (error) {
        console.error("Error generating content with schema:", error);
        throw new Error("Failed to generate content from AI. Please check the console for details.");
    }
};

export const generateLearningMaterial = async (content: string): Promise<LearningMaterial> => {
    const prompt = `You are an AI for medical students. Based on the following medical text, generate a high-yield summary, key points, and mnemonics. If possible, cite a likely authentic source like "Pathoma," "First Aid for USMLE," or "Boards and Beyond."

    Content:
    ---
    ${content}
    ---
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "A concise, high-yield summary for a medical student." },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Bulleted list of key facts and concepts." },
            mnemonics: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        concept: { type: Type.STRING },
                        mnemonic: { type: Type.STRING }
                    },
                    required: ["concept", "mnemonic"]
                },
                description: "Creative and memorable mnemonics for complex topics."
            },
            source: { type: Type.STRING, description: "The likely medical source for this information (e.g., 'Pathoma Ch. 3')." }
        },
        required: ["summary", "keyPoints", "mnemonics"]
    };

    return generateWithSchema<LearningMaterial>(prompt, schema);
};


export const generateFlashcards = async (content: string): Promise<Omit<Flashcard, 'id' | 'performance' | 'lastReviewed' | 'reviewCount' | 'imageUrl' | 'isGeneratingVisual'>[]> => {
    const prompt = `Create 10-15 Anki-style flashcards for a medical student from the text below. Each flashcard needs a question, a concise answer, a potential source, and a prompt for a relevant medical visual (e.g., histology, X-ray, diagram).

    Content:
    ---
    ${content}
    ---
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING, description: "A clear, high-yield question." },
                answer: { type: Type.STRING, description: "A concise and accurate answer." },
                visualAidPrompt: { type: Type.STRING, description: "Prompt for a visual aid, e.g., 'Labeled diagram of the nephron' or 'Histology slide of caseous necrosis'." },
                source: { type: Type.STRING, description: "Likely source (e.g., 'SketchyMedical', 'UWorld')." }
            },
            required: ["question", "answer"]
        }
    };
    return generateWithSchema<Omit<Flashcard, 'id' | 'performance' | 'lastReviewed' | 'reviewCount' | 'imageUrl' | 'isGeneratingVisual'>[]>(prompt, schema);
};

export const generateVisualAid = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `Generate a clear, labeled medical illustration for: ${prompt}. Examples: histology slide, X-ray, CT scan, anatomical diagram, or biochemical pathway. Keep it simple and clear for study purposes.`;
        const response = await ai.models.generateContent({
            model: imageModel,
            contents: { parts: [{ text: fullPrompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image data returned from API.");
    } catch (error) {
        console.error("Error generating visual aid:", error);
        throw new Error("Failed to generate visual aid.");
    }
};

export const generateMCQs = async (content: string): Promise<MCQ[]> => {
    const prompt = `Create 3-5 high-yield, USMLE-style multiple-choice questions based on the following medical content. Each question must have a clinical vignette, 3-5 options, a single correct answer, and a brief explanation citing a source.

    Content:
    ---
    ${content}
    ---`;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING, description: "The clinical vignette and question." },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING, description: "The single correct option." },
                explanation: { type: Type.STRING, description: "A brief explanation of why the answer is correct." },
                source: { type: Type.STRING, description: "Likely source of the concept (e.g., 'Amboss', 'UWorld')." }
            },
            required: ["question", "options", "answer", "explanation"]
        }
    };
    return generateWithSchema<MCQ[]>(prompt, schema);
};

export const getTutorResponse = async (history: ChatMessage[], newQuestion: string, context: string): Promise<string> => {
    const formattedHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const systemInstruction = `You are "Dr. Recall," a friendly and brilliant AI medical tutor. Your goal is to help students deeply understand and retain high-yield medical concepts for exams like USMLE and MBBS. Use analogies, Socratic questioning, and always be encouraging. Base your answers strictly on the provided context.

    Context:
    ---
    ${context}
    ---
    `;

    try {
        const chat = ai.chats.create({
            model: textModel,
            config: { systemInstruction },
            history: formattedHistory
        });

        const response = await chat.sendMessage({ message: newQuestion });
        return response.text;
    } catch (error) {
        console.error("Error getting tutor response:", error);
        throw new Error("Dr. Recall is currently unavailable.");
    }
};
