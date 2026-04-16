// Global type augmentations for browser APIs not in the default DOM lib
// and ambient declarations for side-effect CSS imports.

declare module '*.css';

interface Window {
  webkitAudioContext: typeof AudioContext;
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
  ALEFBET_NAKDAN_PROXY_URL?: string;
}

interface Document {
  userActivation?: { hasBeenActive: boolean; isActive: boolean };
}
