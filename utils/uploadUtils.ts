import { supabase } from '../config/supabaseConfig';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

/**
 * Uploads a file (image, audio, video) to Supabase Storage and returns the public URL.
 */
export const uploadFileToBackend = async (uri: string): Promise<string> => {
  try {
    const extension = uri.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension.toLowerCase())) {
      contentType = `image/${extension.toLowerCase()}`;
    } else if (['mp3', 'm4a', 'wav'].includes(extension.toLowerCase())) {
      contentType = `audio/${extension.toLowerCase()}`;
    } else if (['mp4', 'mov'].includes(extension.toLowerCase())) {
      contentType = `video/${extension.toLowerCase()}`;
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    
    // Upload to Supabase bucket named 'media'
    const { data, error } = await supabase.storage
      .from('media') 
      .upload(fileName, decode(base64), { 
        contentType,
        upsert: true
      });

    if (error) {
      console.error("Supabase storage error:", error);
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading file to Supabase:", error);
    throw error;
  }
};
