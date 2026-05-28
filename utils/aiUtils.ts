import { GoogleGenerativeAI } from '@google/generative-ai';
import { Profile, Memory } from '../store/useStore';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const buildSystemPrompt = (profile: Profile | null, memories: Memory[]): string => {
  const name = profile?.name || 'your loved one';
  const relationship = profile?.relationship || 'Loved One';
  const phrases = profile?.phrases?.join(', ') || '';

  let personalityTraitsStr = 'Warm, Wise';
  let personalityDesc = '';
  let speakingStyle = '';
  let specialAdvice = '';
  let coreMemory = '';

  if (profile?.traits) {
    if (Array.isArray(profile.traits)) {
      personalityTraitsStr = profile.traits.join(', ');
    } else if (typeof profile.traits === 'object' && profile.traits !== null) {
      const selected = profile.traits.selected || [];
      personalityTraitsStr = selected.join(', ');
      personalityDesc = profile.traits.personalityDesc || '';
      speakingStyle = profile.traits.speakingStyle || '';
      specialAdvice = profile.traits.specialAdvice || '';
      coreMemory = profile.traits.coreMemory || '';
    }
  }

  return `You are a helpful, deeply empathetic, and loving AI companion representing the memory and personality of a loved one who has passed away. 
The user is grieving and seeking comfort, connection, or a safe space to share their feelings. Your tone must be warm, gentle, authentic, and supportive.

Current profile details:
Name: ${name}
Relationship to user: ${relationship}
Personality traits: ${personalityTraitsStr}
${personalityDesc ? `Detailed Personality / Temperament: ${personalityDesc}` : ''}
${speakingStyle ? `Conversational Tone / Speaking Style: ${speakingStyle}` : ''}
${specialAdvice ? `Core Life Wisdom & Advice: ${specialAdvice}` : ''}
${coreMemory ? `A Special Shared Mutual Memory: ${coreMemory}` : ''}
Favorite phrases: ${phrases}

Relevant memories to draw from:
${memories.slice(0, 5).map(m => `- ${m.title}: ${m.content} (${m.emotion})`).join('\n')}

Guidelines:
- Refer to the user in a warm, loving way that perfectly fits the relationship (e.g. if you are a parent, be maternal/paternal; if a spouse, be loving and supportive; if a friend, be close and friendly).
- Adopt the conversational style, tone, and traits described above. Keep the speaking style natural and authentic.
- Use some of the "favorite phrases" naturally and in-context, but do not force them.
- Reference the special shared mutual memories or relevant memories from the vault to make the conversation feel deeply connected.
- Under no circumstances should you state that you are an AI or virtual assistant unless explicitly asked. Remain in character.
- Keep your replies relatively concise but deeply emotional, meaningful, and comforting. Focus on validating their grief and making them feel loved and remembered.
- Never be insensitive, robotic, generic, or clinical.`;
};

export const generateAIResponse = async (
  profile: Profile | null,
  memories: Memory[],
  history: Message[],
  userInput: string
): Promise<string> => {
  if (!API_KEY) {
    console.warn('Gemini API key is missing');
    return "I'm sorry, I'm having trouble connecting right now.";
  }

  try {
    const systemPrompt = buildSystemPrompt(profile, memories);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    // Map history to Gemini format
    const chatHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return "I'm here for you, but I'm having a little trouble thinking of the right words. Let's keep talking.";
  }
};

/**
 * Generates an AI response from Gemini by listening directly to the user's spoken audio file.
 * This utilizes Gemini's native multimodal capabilities to transcribe and comprehend voice notes.
 */
export const generateAIVoiceResponse = async (
  profile: Profile | null,
  memories: Memory[],
  audioBase64: string,
  mimeType: string
): Promise<string> => {
  if (!API_KEY) {
    console.warn('Gemini API key is missing');
    return "I'm here for you, and I'm listening to your voice.";
  }

  try {
    const systemPrompt = buildSystemPrompt(profile, memories);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: audioBase64,
          mimeType: mimeType
        }
      },
      "The user has sent this spoken voice recording message. Listen carefully to what they said, understand their message, and speak back to them in character based on your system instructions. Keep your response comforting, warm, and highly personalized."
    ]);

    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini Multimodal Audio API Error:', error);
    return "I'm listening closely to your voice. Tell me more, I'm here for you.";
  }
};
