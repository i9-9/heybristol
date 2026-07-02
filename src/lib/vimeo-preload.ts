let preloadPromise: Promise<typeof import('@vimeo/player')> | null = null;

/** Vimeo's appendVideoMetadata hook throws when chapter data is null. We don't use it. */
function disableVimeoSeoMetadataHook() {
  if (typeof window !== 'undefined') {
    (window as Window & { VimeoSeoMetadataAppended?: boolean }).VimeoSeoMetadataAppended = true;
  }
}

export function preloadVimeoPlayer() {
  if (!preloadPromise) {
    disableVimeoSeoMetadataHook();
    preloadPromise = import('@vimeo/player');
  }
  return preloadPromise;
}
