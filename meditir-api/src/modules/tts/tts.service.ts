import { config } from '../../config';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';

/**
 * Generates TTS audio via ElevenLabs API.
 * Returns a data URL (base64) for the audio — in production this should
 * be stored in object storage (S3/GCS) and the URL returned instead.
 */
export const generateTTSAudio = async (text: string, requestedBy: string): Promise<string> => {
  if (!config.ELEVENLABS_API_KEY || !config.ELEVENLABS_VOICE_ID) {
    throw new AppError('TTS service is not configured', 503);
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${config.ELEVENLABS_VOICE_ID}`;

  let audioBuffer: Buffer;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': config.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.error('ElevenLabs API error', { status: response.status, body: errBody });
      throw new Error(`ElevenLabs returned ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = Buffer.from(arrayBuffer);
  } catch (err) {
    logger.error('TTS generation failed', { error: err, requestedBy });
    throw new AppError('Text-to-speech generation failed', 503);
  }

  // In production: upload to S3/GCS and return the CDN URL
  // For now, return a base64 data URL
  const base64 = audioBuffer.toString('base64');
  return `data:audio/mpeg;base64,${base64}`;
};
