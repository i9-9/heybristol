'use client';

import { useEffect } from 'react';
import { preloadVimeoPlayer } from '@/lib/vimeo-preload';

export default function VimeoPreload() {
  useEffect(() => {
    void preloadVimeoPlayer();
  }, []);

  return null;
}
