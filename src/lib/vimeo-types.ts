// Vimeo Player types (shared across components)
export interface VimeoPlayer {
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  play: () => Promise<void>;
  pause: () => void;
  setMuted: (muted: boolean) => Promise<void>;
  getMuted: () => Promise<boolean>;
  getPaused: () => Promise<boolean>;
  setVolume: (volume: number) => Promise<void>;
  getVolume: () => Promise<number>;
  setCurrentTime?: (time: number) => Promise<void>;
  getDuration?: () => Promise<number>;
  destroy: () => void;
}

export interface VimeoPlayerClass {
  new (element: HTMLIFrameElement): VimeoPlayer;
}

export interface VimeoAPI {
  Player: VimeoPlayerClass;
}

declare global {
  interface Window {
    Vimeo?: VimeoAPI;
  }
}
