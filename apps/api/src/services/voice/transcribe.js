import { config } from '../../config/env.js';

/**
 * transcribe — convert a voice attachment to text.
 * VOICE_PROVIDER=mock returns a fixed transcript for demos; a real Google
 * Speech-to-Text integration would slot in here.
 */
export async function transcribe(attachment) {
  if (!attachment) return '';
  if (config.VOICE_PROVIDER === 'mock') {
    return 'I need a black dress for Eid, size medium';
  }
  throw new Error(`voice provider not implemented: ${config.VOICE_PROVIDER}`);
}

export default transcribe;
