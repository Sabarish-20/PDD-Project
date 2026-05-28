import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

async function testGemini() {
  if (!API_KEY) {
    console.error('❌ API KEY MISSING');
    return;
  }

  console.log('--- Testing Gemini API ---');
  console.log('Using Key:', API_KEY.substring(0, 10) + '...');

  const ai = new GoogleGenAI({
    apiKey: API_KEY,
    apiVersion: 'v1'
  });

  const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

  for (const modelName of modelsToTry) {
    try {
      console.log(`\nTrying model: ${modelName}...`);
      const result = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: 'Say "Connection Successful"' }] }]
      });
      console.log(`✅ ${modelName} Success:`, result.text);
      break; // Stop if we find a working one
    } catch (err: any) {
      console.error(`❌ ${modelName} Failed:`, err.message);
    }
  }
}

testGemini();
