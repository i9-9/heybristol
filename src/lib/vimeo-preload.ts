let preloadPromise: Promise<typeof import('@vimeo/player')> | null = null;

export function preloadVimeoPlayer() {
  if (!preloadPromise) {
    preloadPromise = import('@vimeo/player');
  }
  return preloadPromise;
}
