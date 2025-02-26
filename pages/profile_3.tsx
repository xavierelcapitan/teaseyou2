import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../lib/firebase";
import { useRouter } from 'next/router';
import Header from '../components/Header';
import dynamic from 'next/dynamic';

const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Met à jour le profil utilisateur dans Firestore.
 */
async function updateUserProfile(userId: string, updatedData: any) {
  try {
    await setDoc(doc(db, "users", userId), updatedData, { merge: true });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
  }
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileCounter, setFileCounter] = useState(10);
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [recordingTimeout, setRecordingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [ready, setReady] = useState(false);

  const interests = [
    "Art", "Astronomie", "Bricolage", "Cinéma", "Cuisine", "Danse", "Écriture", "Escalade", "Fitness", "Football",
    "Gaming", "Gastronomie", "Golf", "Jardinage", "Lecture", "Musique", "Natation", "Peinture", "Photographie", "Piano",
    "Randonnée", "Running", "Sculpture", "Ski", "Surf", "Tennis", "Théâtre", "Voyages", "Yoga", "Zumba",
    "Basketball", "Boxe", "Chant", "Cyclisme", "Dessin", "Équitation", "Escrime", "Informatique", "Judo", "Karaté",
    "Kitesurf", "Langues", "Méditation", "Mode", "Pêche", "Plongée", "Rugby", "Scrabble", "Snowboard", "Voile"
  ].sort();

  const [profileData, setProfileData] = useState({
    firstName: '',
    age: '',
    city: '',
    gender: '',
    relationshipType: '',
    partnerGender: '',
    partnerAgeRange: { min: 18, max: 99 },
    distance: 5,
    email: user?.email || '',
    videoURL: '',
    imageURL: '',
    interests: [],
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData(data as typeof profileData);
            setBio(data.bio || '');
            setSelectedInterests(data.interests || []);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du profil :", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  useEffect(() => {
    const loadFFmpeg = async () => {
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
        setReady(true);
      }
    };
    loadFFmpeg();
  }, []);

  /**
   * Upload simple d'un fichier dans Firebase Storage et récupération de son URL.
   */
  const uploadFile = async (file: File, path: string) => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Erreur lors de l'upload ou de la récupération de l'URL :", error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const timeout = setTimeout(() => {
        stopRecording();
        alert("L'enregistrement a été arrêté après 30 secondes.");
      }, 30000); // 30 secondes
      setRecordingTimeout(timeout);
    } catch (err) {
      console.error("Erreur accès caméra : ", err);
    }
  };

  const stopRecording = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (recordingTimeout) {
      clearTimeout(recordingTimeout);
      setRecordingTimeout(null);
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideoFile(event.target.files[0]);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    stopRecording();
  };

  const handleInterestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value !== "----" && !selectedInterests.includes(value) && selectedInterests.length < 8) {
      setSelectedInterests([...selectedInterests, value]);
    }
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(selectedInterests.filter(i => i !== interest));
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  const calculateCompletionPercentage = () => {
    const fields = [
      profileData.firstName,
      profileData.age,
      profileData.city,
      profileData.gender,
      profileData.relationshipType,
      profileData.partnerGender,
      profileData.partnerAgeRange.min,
      profileData.partnerAgeRange.max,
      bio,
      profileData.videoURL,
      profileData.imageURL,
      ...selectedInterests
    ];

    const filledFields = fields.filter(field => field && field !== '').length;
    const totalFields = fields.length;

    return Math.round((filledFields / totalFields) * 100);
  };

  /**
   * Gère la sauvegarde du profil :
   * - Upload de la vidéo (si présente)
   * - Upload de l'image de profil (si présente)
   * - Mise à jour du profil dans Firestore
   */
  const handleSaveProfile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (user) {
      try {
        const completionPercentage = calculateCompletionPercentage();
        if (videoFile) {
          const videoURL = await uploadFile(videoFile, `videos/${user.uid}/${videoFile.name}`);
          profileData.videoURL = videoURL;
        }
        if (imageFile) {
          // On détermine l'extension d'origine de l'image
          const ext = imageFile.name.split('.').pop();
          const imageName = `teaseyou-${fileCounter}.${ext}`;
          const imageURL = await uploadFile(imageFile, `images/profiles/${user.uid}/${imageName}`);
          profileData.imageURL = imageURL;
          setFileCounter(fileCounter + 1);
        }
        await updateUserProfile(user.uid, { ...profileData, bio, interests: selectedInterests, completionPercentage });
        router.push('/');
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du profil :", error);
      }
    }
  };

  const handleProcessVideo = async (file: File) => {
    if (!ready) {
      console.log("FFmpeg is not ready yet.");
      return;
    }

    // Exemple de traitement vidéo
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));
    await ffmpeg.run('-i', 'input.mp4', 'output.mp4');
    const data = ffmpeg.FS('readFile', 'output.mp4');

    // Utilisez le fichier traité
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    console.log("Processed video URL:", url);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header title="Mon Profil" />
      <div className="px-4 flex-grow">
        {/* Formulaire de profil */}
        <form className="space-y-6 mb-40">
          {/* Email en lecture seule */}
          <div className="mt-4 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#FF5F6D] mb-4">Email (non modifiable)</h2>
            <input
              type="email"
              className="input input-bordered w-full bg-gray-50 border-gray-300 text-[#E63946]"
              value={profileData.email}
              readOnly
            />
          </div>

          {/* Informations Personnelles */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#FF5F6D] mb-4">Informations Personnelles</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-gray-50 border-gray-300 text-[#E63946]"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Âge</label>
                  <input
                    type="number"
                    className="input input-bordered w-full bg-gray-50 border-gray-300 text-[#E63946]"
                    value={profileData.age}
                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sexe</label>
                  <select
                    className="select select-bordered w-full bg-gray-50 border-gray-300 text-gray-700"
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                  >
                    <option value="">---</option>
                    <option>Homme</option>
                    <option>Femme</option>
                    <option>Non-binaire</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ville</label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-gray-50 border-gray-300 text-[#E63946]"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#FF5F6D] mb-4">Qui suis-je ?</h2>
            <textarea
              value={bio}
              onChange={handleBioChange}
              maxLength={500}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-500"
              placeholder="Écrivez votre bio ici..."
              rows={10}
            />
            <p className="text-sm text-gray-500 mt-1">{bio.length}/500 caractères</p>

            {/* Centres d'intérêts */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Centres d'intérêts
              </label>
              <select
                className="select select-bordered w-full bg-gray-50 border-gray-300 text-gray-700"
                onChange={handleInterestChange}
              >
                <option value="----">----</option>
                {interests.map(interest => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
              <div className="flex flex-wrap mt-2">
                {selectedInterests.sort().map(interest => (
                  <div key={interest} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {interest}
                    <button onClick={() => removeInterest(interest)} className="ml-2 text-red-500">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Préférences de Recherche */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#FF5F6D] mb-4">Préférences de Recherche</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type de relation recherchée
                </label>
                <select
                  className="select select-bordered w-full bg-gray-50 border-gray-300 text-gray-700"
                  value={profileData.relationshipType}
                  onChange={(e) => setProfileData({ ...profileData, relationshipType: e.target.value })}
                >
                  <option value="">---</option>
                  <option>Relation amoureuse / sérieuse</option>
                  <option>Rencontre casual / sans prise de tête</option>
                  <option>Amitié</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Genre du partenaire recherché
                </label>
                <select
                  className="select select-bordered w-full bg-gray-50 border-gray-300 text-gray-700"
                  value={profileData.partnerGender}
                  onChange={(e) => setProfileData({ ...profileData, partnerGender: e.target.value })}
                >
                  <option value="">---</option>
                  <option>Homme</option>
                  <option>Femme</option>
                  <option>Non-binaire</option>
                  <option>Peu importe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tranche d'âge du partenaire recherché
                </label>
                <div className="flex space-x-2">
                  <select
                    className="select select-bordered w-1/2 bg-gray-50 border-gray-300 text-gray-700"
                    value={profileData.partnerAgeRange.min}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        partnerAgeRange: {
                          ...profileData.partnerAgeRange,
                          min: parseInt(e.target.value),
                        },
                      })
                    }
                  >
                    {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                  <select
                    className="select select-bordered w-1/2 bg-gray-50 border-gray-300 text-gray-700"
                    value={profileData.partnerAgeRange.max}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        partnerAgeRange: {
                          ...profileData.partnerAgeRange,
                          max: parseInt(e.target.value),
                        },
                      })
                    }
                  >
                    {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Distance géographique
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="5"
                    max="999"
                    value={profileData.distance}
                    onChange={(e) =>
                      setProfileData({ ...profileData, distance: Number(e.target.value) })
                    }
                    className="range w-2/3"
                    style={{ background: '#E63946' }}
                  />
                  <span className="text-sm font-bold text-gray-700 pl-5">
                    {profileData.distance} km
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Médias */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#FF5F6D] mb-4">Médias</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mon Teaser</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn bg-[#E63946] text-white"
                  >
                    Enregistrer une vidéo
                  </button>
                  <input
                    type="file"
                    accept="video/mp4,video/x-m4v,video/*"
                    onChange={handleVideoChange}
                    className="file-input w-full bg-gray-50 border-gray-300 focus:border-[#E63946] focus:ring-[#E63946]"
                  />
                </div>
                {stream && (
                  <div className="mt-4">
                    <video ref={videoRef} autoPlay className="w-full h-64 bg-black"></video>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="btn bg-red-500 text-white mt-2"
                    >
                      Arrêter l'enregistrement
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Photo de Profil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input w-full bg-gray-50 border-gray-300 focus:border-[#E63946] focus:ring-[#E63946]"
                />
              </div>
            </div>
          </div>

          {/* Boutons de navigation / Sauvegarde */}
          <div className="flex justify-between mt-6">
            <div className="flex space-x-4">
              <button className="btn btn-circle bg-gray-300 text-white">
                <span className="material-icons">flight</span>
              </button>
              <button className="btn btn-circle bg-gray-300 text-white">
                <span className="material-icons">delete_forever</span>
              </button>
            </div>
            <button
              className="btn btn-circle bg-[#E63946] text-white"
              onClick={handleSaveProfile}
            >
              <span className="material-icons">check</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal pour la vidéo */}
      {isModalOpen && videoFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            <button
              onClick={closeModal}
              className="absolute top-0 right-0 m-4 text-white text-2xl"
            >
              ×
            </button>
            <video controls className="max-w-full max-h-full">
              <source src={URL.createObjectURL(videoFile)} type={videoFile.type} />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;