import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

async function listModels() {
  if (!API_KEY) {
    console.error('❌ API KEY MISSING');
    return;
  }

  console.log('--- Listing Available Gemini Models ---');
  
  const ai = new GoogleGenAI({
    apiKey: API_KEY,
  });

  try {
    const response = await ai.models.list();
    // In some versions it's an object with a models property, in others it's an array
    const modelList = Array.isArray(response) ? response : (response as any).models || [];
    
    console.log('✅ Models found:', modelList.length);
    modelList.forEach((m: any) => console.log(`- ${m.name}`));
  } catch (err: any) {
    console.error('❌ Failed to list models:', err.message);
  }
}

listModels();
