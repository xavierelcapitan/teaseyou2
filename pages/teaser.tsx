"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image'
import ReactPlayer from 'react-player'
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "../lib/firebase";
import Header from '../components/Header';

const storage = getStorage(app);

export default function TeaseYouUploader() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter();
  const { user, loading } = useAuth();

  // Mise à jour de l'état lors de la sélection de fichiers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    setFiles(files)
  }

  // Fonction pour lancer l'upload vers Firebase Storage
  const handleUpload = async () => {
    if (!files) return
    setUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const storageRef = ref(storage, `teaser/${file.name}`)
        await uploadBytes(storageRef, file)
        console.log(`Uploaded ${file.name} to Firebase Storage`)
      }
      // Vous pouvez ajouter ici un retour visuel ou rediriger l'utilisateur
    } catch (error) {
      console.error('Error uploading:', error)
    } finally {
      setUploading(false)
    }
  }

  // Fonctions pour vérifier le type du fichier
  const isImage = (file: File) => file.type.startsWith('image')
  const isVideo = (file: File) => file.type.startsWith('video')

  useEffect(() => {
    console.log('User:', user);
    console.log('Loading:', loading);
    const timer = setTimeout(() => {
      if (!loading && !user) {
        console.log('Redirecting to /profile');
        router.push('/profile');
      }
    }, 500); // Délai de 500ms

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header title="Mon Teaser" />
      <main className="flex flex-col items-center justify-between p-24">
        <h1 className="text-4xl font-bold mb-4">
          Téléchargez votre teaser (30 secondes maximum)
        </h1>
        <input
          type="file"
          onChange={handleFileChange}
          multiple
          accept="video/*, image/*"
          className="mb-4"
        />
        {files && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-8"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
        <div className="flex flex-col items-center justify-center">
          {files &&
            Array.from(files).map((file, index) => (
              <div key={index} className="flex flex-col items-center justify-center mb-4">
                {isImage(file) && (
                  <Image
                    src={URL.createObjectURL(file)}
                    width={500}
                    height={500}
                    alt='Uploaded Media'
                  />
                )}
                {isVideo(file) && (
                  <ReactPlayer
                    url={URL.createObjectURL(file)}
                    controls={true}
                    width="80%"
                    height="auto"
                  />
                )}
              </div>
            ))
          }
        </div>
      </main>
    </div>
  )
}
