// Global type augmentations for browser APIs not in the default DOM lib
// and ambient declarations for side-effect CSS imports.

declare module '*.css';

interface Window {
  webkitAudioContext: typeof AudioContext;
}
