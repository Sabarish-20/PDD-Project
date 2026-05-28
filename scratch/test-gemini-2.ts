import { GoogleGenerativeAI } from '@google/generative-ai';
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

  console.log('--- Testing Gemini API (Gemini 2.0 Flash) ---');
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  try {
    const result = await model.generateContent('Say "API working perfectly"');
    console.log('✅ Success:', result.response.text());
  } catch (err: any) {
    console.error('❌ Failed:', err.message);
  }
}

testGemini();
