import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

async function testElevenLabs() {
  if (!API_KEY) {
    console.error('❌ ELEVENLABS API KEY MISSING');
    return;
  }

  console.log('--- Testing ElevenLabs API ---');
  console.log('Using Key:', API_KEY.substring(0, 10) + '...');

  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': API_KEY,
      },
    });
    console.log('✅ Success! Found voices:', response.data.voices.length);
    console.log('Sample voices:', response.data.voices.slice(0, 3).map((v: any) => v.name).join(', '));
  } catch (err: any) {
    console.error('❌ ElevenLabs Failed:', err.response?.data || err.message);
  }
}

testElevenLabs();
