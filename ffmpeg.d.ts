// ffmpeg.d.ts

declare module '@ffmpeg/ffmpeg' {
    export interface FFmpeg {
      load: () => Promise<void>;
      run: (...args: string[]) => Promise<void>;
      FS: (method: string, ...args: any[]) => any;
    }
  
    export interface FFmpegOptions {
      log?: boolean;
      corePath?: string;
    }
  
    export function createFFmpeg(options?: FFmpegOptions): FFmpeg;
    export function fetchFile(source: File | string): Promise<Uint8Array>;
  }
  