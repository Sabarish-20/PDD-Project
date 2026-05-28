import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import { encode } from 'base64-arraybuffer';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const API_URL = 'https://api.elevenlabs.io/v1';

/**
 * Creates a cloned voice on ElevenLabs using an audio file.
 * @param name The name of the voice (usually the loved one's name)
 * @param fileUri The local URI of the audio file to clone from
 * @returns The voice_id from ElevenLabs
 */
export const createElevenLabsVoice = async (name: string, fileUri: string): Promise<string> => {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API Key is missing. Please add EXPO_PUBLIC_ELEVENLABS_API_KEY to your .env file.');
  }

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', `Cloned voice for ${name} - GriefBridge`);
    
    // In React Native, we append the file like this
    const fileExtension = fileUri.split('.').pop() || 'mp3';
    formData.append('files', {
      uri: fileUri,
      name: `sample.${fileExtension}`,
      type: `audio/${fileExtension === 'mp3' ? 'mpeg' : fileExtension}`,
    } as any);

    const response = await axios.post(`${API_URL}/voices/add`, formData, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.voice_id;
  } catch (error: any) {
    console.error('ElevenLabs Create Voice Error:', error.response?.data || error.message);
    throw new Error('Failed to create cloned voice. Ensure your audio sample is clear and your API key is valid.');
  }
};

/**
 * Generates speech from text using a specific voice ID.
 * @param text The text to convert to speech
 * @param voiceId The ElevenLabs voice_id
 * @returns Local URI of the generated audio file
 */
export const generateSpeech = async (text: string, voiceId: string): Promise<string> => {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API Key is missing.');
  }

  try {
    const response = await axios.post(
      `${API_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    // Save the audio to a temporary file
    const path = `${FileSystem.cacheDirectory}elevenlabs-${Date.now()}.mp3`;
    const base64Data = encode(response.data);
    await FileSystem.writeAsStringAsync(path, base64Data, {
      encoding: 'base64',
    });

    return path;
  } catch (error: any) {
    let errorMessage = error.message;
    if (error.response?.data) {
      try {
        // Since responseType is 'arraybuffer', Axios wraps the JSON error string in a binary buffer.
        // We decode it back to read the exact ElevenLabs error detail.
        const arrayBuffer = error.response.data;
        const uint8Array = new Uint8Array(arrayBuffer);
        let decodedText = '';
        for (let i = 0; i < uint8Array.length; i++) {
          decodedText += String.fromCharCode(uint8Array[i]);
        }
        console.error('ElevenLabs TTS Detailed Error Response:', decodedText);
        const errorJson = JSON.parse(decodedText);
        errorMessage = errorJson?.detail?.message || decodedText;
      } catch (decodeError) {
        console.error('Failed to decode binary ElevenLabs error:', decodeError);
      }
    }
    console.error('ElevenLabs TTS Error:', errorMessage);
    throw new Error(`Failed to generate speech: ${errorMessage}`);
  }
};
