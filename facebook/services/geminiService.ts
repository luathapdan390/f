import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Evaluation, PracticeEvaluation, TransformedBeliefs } from "./types"; // Cập nhật import types nếu cần

const beliefSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: "The empowering belief in English." },
        tense: { type: Type.STRING, description: "The English tense used." },
        translation: { type: Type.STRING, description: "A Vietnamese translation of the English belief text." }
    },
    required: ["text", "tense", "translation"]
};

const transformedBeliefsSchema = {
    type: Type.OBJECT,
    properties: {
        logic: {
            type: Type.ARRAY,
            description: "Exactly 5 beliefs related to the Logic Brain.",
            items: beliefSchema
        },
        emotion: {
            type: Type.ARRAY,
            description: "Exactly 5 beliefs related to the Emotion Brain.",
            items: beliefSchema
        },
        animal: {
            type: Type.ARRAY,
            description: "Exactly 5 beliefs related to the Animal Brain (instinct, action).",
            items: beliefSchema
        },
    },
    required: ["logic", "emotion", "animal"]
};

// Hàm chính để chuyển đổi niềm tin
export async function generateFacebookMindsetShift(topic: string, belief1: string, belief2: string): Promise<TransformedBeliefs> {

    // Khởi tạo AI Client và sử dụng biến môi trường GEMINI_API_KEY
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

    const prompt = `A user wants to overcome their limiting beliefs about posting on Facebook. Their desired topic to post about is "${topic}".
    
    Belief 1: ${belief1}
    Belief 2: ${belief2}
    
    Your task is to:
    1. Reframe Belief 1 using Tony Robbins' 6 Human Needs (Certainty, Variety, Significance, Connection, Growth, Contribution). For each need, provide a short, positive, actionable statement.
    2. Reframe Belief 2 using the same 6 Human Needs framework. Focus on how small, consistent actions overcome resource limitations.
    3. Generate a list of 5 concrete, actionable content ideas for the user's topic: "${topic}".
    
    Instructions:
    *Analyze and Reuse Keywords:** Identify key nouns, verbs, and concepts from the user's belief (e.g., "bố tôi", "quân đội"). Weave these exact words or concepts into the reframe statements.
    *Framework:** Generate exactly 5 beliefs for each of the Logic Brain, Emotion Brain, and Animal Brain sections (15 beliefs total).
    *5 for the Logic Brain:** Reframe the situation logically. Find evidence in the limiting belief that actually supports large-scale success. Example: "My father served in the army, the largest-scale organization in Vietnam, which means I have inherited a blueprint for large-scale success."
    *5 for the Emotion Brain:** Connect the emotions from the original belief to the new, desired outcome. Example: "My father loved the army, therefore I seek large-scale love and belonging in my community."
    *5 for the Animal Brain:** Focus on instinct, action, and simple, repeatable behaviors. Frame "scaling" as a verb, an action. Example: "I am scaling my operations daily; it is an action, a verb."
    *Use 12 English Tenses:** Spread a variety of English tenses across the 15 beliefs to create a comprehensive mindset shift across time (past, present, future).
    *Translate:** Provide a Vietnamese translation for each English belief.
    *Output Format:** Return the result in the specified JSON format.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            systemInstruction: "You are a world-class mindset coach. You transform limiting beliefs into empowering ones using a specific framework involving 3 'brains' (Logic, Emotion, Animal) and a total of 15 empowering beliefs.",
            responseMimeType: "application/json",
            responseSchema: transformedBeliefsSchema,
        }
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as TransformedBeliefs;
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", jsonText);
        throw new Error("The AI returned an invalid response format.");
    }
}

// Hàm chuyển văn bản thành giọng nói (Giữ nguyên logic API Key)
export async function generateSpeech(text: string): Promise<string> {
    
    // Logic của hàm này sẽ hoạt động với API Key của bạn
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceName: 'Kore' }, // A friendly, clear voice
            }
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
        throw new Error("Audio data not found in the API response.");
    }

    return base64Audio;
}
