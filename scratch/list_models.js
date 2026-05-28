const { GoogleGenAI } = require('@google/genai');

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('EXPO_PUBLIC_GEMINI_API_KEY not found');
  process.exit(1);
}

const client = new GoogleGenAI({ apiKey: API_KEY });

async function list() {
  try {
    const response = await client.models.list();
    console.log('Available Models:', JSON.stringify(response, null, 2));
  } catch (e) {
    console.error('Error listing models:', e);
  }
}

list();
