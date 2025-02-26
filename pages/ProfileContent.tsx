// ProfileContent.tsx
"use client"; // si tu es sur Next 13+ (app router), sinon pas indispensable en pages/

import React, { useState, useEffect } from 'react';

export default function ProfileContent() {
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpeg, setFfmpeg] = useState<any>(null);

  useEffect(() => {
    // On charge ffmpeg uniquement côté client
    const loadFfmpeg = async () => {
      const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg');
      const ff = createFFmpeg({ log: true });
      await ff.load();
      setFfmpeg(ff);
      setFfmpegLoaded(true);
    };
    loadFfmpeg();
  }, []);

  const handleCompress = async (file: File) => {
    if (!ffmpeg) return;
    ffmpeg.FS('writeFile', 'input.mp4', await (await import('@ffmpeg/ffmpeg')).fetchFile(file));
    await ffmpeg.run('-i', 'input.mp4', 'output.mp4');
    const data = ffmpeg.FS('readFile', 'output.mp4');
    // ... faire quelque chose avec data ...
  };

  return (
    <div>
      {ffmpegLoaded ? (
        <p>FFmpeg chargé !</p>
      ) : (
        <p>Chargement de FFmpeg...</p>
      )}
      {/* Ici ton UI, champs pour uploader, etc. */}
    </div>
  );
}
