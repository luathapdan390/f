import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { FacebookMindsetShift } from '../types';

export async function generateFacebookMindsetShift(topic: string, belief1: string, belief2: string): Promise<FacebookMindsetShift> {
  if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using mocked data.");
    return new Promise(resolve => setTimeout(() => resolve({
      beliefReframing: {
        certainty: "Posting creates a certain anchor for your thoughts, making your knowledge concrete and shareable.",
        variety: "You can post in diverse formats: text, images, videos, links. Every day offers a new angle.",
        significance: "Your unique perspective is valuable. Sharing it establishes you as a knowledgeable voice in your niche.",
        connection: "Each post is an invitation for connection, sparking conversations and building a community around shared interests.",
        growth: "The act of formulating and sharing ideas forces you to learn and grow your own understanding of the topic.",
        contribution: "You are contributing a piece of value to the world that could be the exact solution someone is looking for."
      },
      resourceReframing: {
        certainty: "Certainty comes from starting small. A commitment of just 10 minutes a day is achievable and builds momentum.",
        variety: "You'll discover a variety of new tools and workflows that make content creation easier and more enjoyable.",
        significance: "Consistency makes you significant. You become a reliable and respected source of information.",
        connection: "Regular posting builds a deep, trusting relationship with your audience. They look forward to hearing from you.",
        growth: "You will grow into a more efficient and effective communicator, a skill that benefits all areas of life.",
        contribution: "Your consistent contribution creates a library of value for others, a lasting legacy of your knowledge."
      },
      contentIdeas: [
        `Share a surprising statistic about "${topic}".`,
        `Post a quick 'myth vs. fact' about "${topic}".`,
        `Ask your audience a question related to a common challenge in "${topic}".`,
        `Share a personal story or insight about your journey with "${topic}".`,
        `Recommend a book, podcast, or tool related to "${topic}".`
      ]
    }), 1500));
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema = {
      type: Type.OBJECT,
      properties: {
        beliefReframing: {
          type: Type.OBJECT,
          description: "Reframe the belief about lacking ideas using the 6 human needs.",
          properties: {
            certainty: { type: Type.STRING, description: "Certainty reframing." },
            variety: { type: Type.STRING, description: "Variety reframing." },
            significance: { type: Type.STRING, description: "Significance reframing." },
            connection: { type: Type.STRING, description: "Connection reframing." },
            growth: { type: Type.STRING, description: "Growth reframing." },
            contribution: { type: Type.STRING, description: "Contribution reframing." },
          },
          required: ['certainty', 'variety', 'significance', 'connection', 'growth', 'contribution']
        },
        resourceReframing: {
          type: Type.OBJECT,
           description: "Reframe the belief about lacking resources/consistency using the 6 human needs.",
          properties: {
            certainty: { type: Type.STRING, description: "Certainty reframing." },
            variety: { type: Type.STRING, description: "Variety reframing." },
            significance: { type: Type.STRING, description: "Significance reframing." },
            connection: { type: Type.STRING, description: "Connection reframing." },
            growth: { type: Type.STRING, description: "Growth reframing." },
            contribution: { type: Type.STRING, description: "Contribution reframing." },
          },
          required: ['certainty', 'variety', 'significance', 'connection', 'growth', 'contribution']
        },
        contentIdeas: {
          type: Type.ARRAY,
          description: `A list of 5 content ideas for the topic: ${topic}.`,
          items: { type: Type.STRING }
        }
      },
      required: ['beliefReframing', 'resourceReframing', 'contentIdeas']
  };

  const prompt = `
    A user wants to overcome their limiting beliefs about posting on Facebook. Their desired topic to post about is "${topic}".
    
    Belief 1: "${belief1}"
    Belief 2: "${belief2}"

    Your task is to:
    1. Reframe Belief 1 using Tony Robbins' 6 Human Needs (Certainty, Variety, Significance, Connection, Growth, Contribution). For each need, provide a short, powerful, and encouraging statement on how posting can fulfill it.
    2. Reframe Belief 2 using the same 6 Human Needs framework. Focus on how small, consistent actions overcome resource limitations.
    3. Generate a list of 5 concrete, actionable content ideas for the user's topic: "${topic}".

    Provide the output in the requested JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  try {
    const json = JSON.parse(response.text);
    return json;
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Received an invalid response from the AI. Please try again.");
  }
}

export async function generateSpeech(text: string): Promise<string> {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not set for audio generation. This feature will not work.");
        throw new Error("API Key not configured for audio generation.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }, // A friendly, clear voice
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("Audio data not found in the API response.");
    }

    return base64Audio;
}
