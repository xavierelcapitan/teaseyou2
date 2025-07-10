// profile.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "../lib/firebase";
import Header from '../components/Header';
import Loader from '../components/Loader';

const db = getFirestore(app);
const storage = getStorage(app);

interface ProfileData {
  email: string;
  firstName: string;
  age: string;
  gender: string;
  city: string;
  relationshipType: string;
  partnerGender: string;
  partnerAgeRange: {
    min: number;
    max: number;
  };
  imageURL?: string;
  bio?: string;
  interests?: string[];
  completionPercentage?: number;
}

/**
 * Met à jour le profil utilisateur dans Firestore.
 */
async function updateUserProfile(userId: string, updatedData: any) {
  try {
    await setDoc(doc(db, "users", userId), updatedData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    return { success: false, error };
  }
}

function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  // État lié au profil
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    email: '',
    firstName: '',
    age: '',
    gender: '',
    city: '',
    relationshipType: '',
    partnerGender: '',
    partnerAgeRange: { min: 18, max: 99 },
  });

  const interests = [
    "Art", "Astronomie", "Bricolage", "Cinéma", "Cuisine", "Danse", "Écriture", "Escalade", "Fitness", "Football",
    "Gaming", "Gastronomie", "Golf", "Jardinage", "Lecture", "Musique", "Natation", "Peinture", "Photographie", "Piano",
    "Randonnée", "Running", "Sculpture", "Ski", "Surf", "Tennis", "Théâtre", "Voyages", "Yoga", "Zumba",
    "Basketball", "Boxe", "Chant", "Cyclisme", "Dessin", "Équitation", "Escrime", "Informatique", "Judo", "Karaté",
    "Kitesurf", "Langues", "Méditation", "Mode", "Pêche", "Plongée", "Rugby", "Scrabble", "Snowboard", "Voile"
  ].sort();

  // Charger le profil depuis Firestore
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData({
              email: data.email || user.email || '',
              firstName: data.firstName || '',
              age: data.age || '',
              gender: data.gender || '',
              city: data.city || '',
              relationshipType: data.relationshipType || '',
              partnerGender: data.partnerGender || '',
              partnerAgeRange: data.partnerAgeRange || { min: 18, max: 99 },
              imageURL: data.imageURL,
              bio: data.bio,
              interests: data.interests,
              completionPercentage: data.completionPercentage
            });
            setBio(data.bio || '');
            setSelectedInterests(data.interests || []);
            if (data.imageURL) {
              setImagePreview(data.imageURL);
            }
          } else {
            // Initialiser avec l'email de l'utilisateur
            setProfileData((prev: ProfileData) => ({
              ...prev,
              email: user.email || ''
            }));
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du profil :", error);
          setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' });
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
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fonction pour uploader l'image
  const uploadFile = async (file: File, path: string) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
      throw error;
    }
  };

  // Gestion des champs image
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Intérêts / bio
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

  // Calcul du taux de remplissage
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
      imagePreview || profileData.imageURL,
      ...selectedInterests
    ];

    const filledFields = fields.filter(field => field && field !== '').length;
    const totalFields = 11; // Nombre fixe de champs obligatoires

    return Math.round((filledFields / totalFields) * 100);
  };

  // Validation du formulaire
  const isFormValid = () => {
    return (
      profileData.firstName &&
      profileData.age &&
      profileData.city &&
      profileData.gender &&
      profileData.relationshipType &&
      profileData.partnerGender
    );
  };

  // Sauvegarde du profil
  const handleSaveProfile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({ type: 'error', text: 'Vous devez être connecté' });
      return;
    }

    if (!isFormValid()) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      let imageURL = profileData.imageURL;
      
      // Upload de l'image si présente
      if (imageFile) {
        const timestamp = Date.now();
        const ext = imageFile.name.split('.').pop();
        const imageName = `profile-${timestamp}.${ext}`;
        imageURL = await uploadFile(imageFile, `images/profiles/${user.uid}/${imageName}`);
        
        // Supprimer l'ancienne image si elle existe
        if (profileData.imageURL) {
          try {
            const oldImageRef = ref(storage, profileData.imageURL);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.log("Ancienne image déjà supprimée ou inexistante");
          }
        }
      }

      const completionPercentage = calculateCompletionPercentage();

      // Mise à jour Firestore
      const updatedData = {
        ...profileData,
        bio,
        interests: selectedInterests,
        completionPercentage,
        imageURL,
        updatedAt: new Date().toISOString()
      };

      const result = await updateUserProfile(user.uid, updatedData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profil enregistré avec succès!' });
        setProfileData((prev: ProfileData) => ({ ...prev, imageURL }));
        setImageFile(null);
        
        // Rediriger après 2 secondes
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement du profil' });
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du profil :", error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement du profil' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (user) {
      try {
        // Supprimer le document utilisateur de Firestore
        await deleteDoc(doc(db, "users", user.uid));

        // Supprimer l'image de profil de Firebase Storage
        if (profileData.imageURL) {
          const imageRef = ref(storage, profileData.imageURL);
          await deleteObject(imageRef);
        }

        // Rediriger l'utilisateur après la suppression
        router.push('/login');
      } catch (error) {
        console.error("Erreur lors de la suppression du profil :", error);
        setMessage({ type: 'error', text: 'Erreur lors de la suppression du profil' });
      }
    }
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowDeleteModal(true);
  };

  // Rendu
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header title="Mon Profil" />
      <div className="px-4 flex-grow">
        {/* Message de feedback */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

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
                <label className="block text-sm font-medium text-gray-700">Prénom *</label>
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
                  <label className="block text-sm font-medium text-gray-700">Âge *</label>
                  <input
                    type="number"
                    className="input input-bordered w-full bg-gray-50 border-gray-300 text-[#E63946]"
                    value={profileData.age}
                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sexe *</label>
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
                <label className="block text-sm font-medium text-gray-700">Ville *</label>
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

          {/* Bio et Centres d'intérêts */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#FF5F6D] mb-4">Qui suis-je ?</h2>
            <textarea
              value={bio}
              onChange={handleBioChange}
              maxLength={500}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700"
              placeholder="Écrivez votre bio ici..."
              rows={10}
            />
            <p className="text-sm text-gray-500 mt-1">{bio.length}/500 caractères</p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Centres d'intérêts</label>
              <select
                className="select select-bordered w-full bg-gray-50 border-gray-300 text-gray-700"
                onChange={handleInterestChange}
                value="----"
              >
                <option value="----">----</option>
                {interests.map(interest => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
              <div className="flex flex-wrap mt-2">
                {selectedInterests.sort().map(interest => (
                  <div
                    key={interest}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                  >
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
                <label className="block text-sm font-medium text-gray-700">Type de relation recherchée *</label>
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
                <label className="block text-sm font-medium text-gray-700">Genre du partenaire recherché *</label>
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
                <label className="block text-sm font-medium text-gray-700">Tranche d'âge du partenaire recherché</label>
                <div className="flex space-x-2">
                  <select
                    className="select select-bordered w-1/2 bg-gray-50 border-gray-300 text-gray-700"
                    value={profileData.partnerAgeRange.min}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        partnerAgeRange: { ...profileData.partnerAgeRange, min: parseInt(e.target.value) },
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
                        partnerAgeRange: { ...profileData.partnerAgeRange, max: parseInt(e.target.value) },
                      })
                    }
                  >
                    {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Photo de Profil */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#FF5F6D] mb-4">Photo de Profil</h2>
            
            {/* Aperçu de l'image */}
            {imagePreview && (
              <div className="mb-4">
                <img 
                  src={imagePreview} 
                  alt="Aperçu du profil" 
                  className="w-32 h-32 object-cover rounded-full mx-auto"
                />
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input w-full bg-gray-50 border-gray-300 focus:border-[#E63946] focus:ring-[#E63946]"
            />
            {imageFile && (
              <p className="text-sm text-green-600 mt-2">Nouvelle image sélectionnée : {imageFile.name}</p>
            )}
          </div>

          {/* Mon Teaser */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#FF5F6D] mb-4">Mon Teaser</h2>
            <button
              type="button"
              className="btn bg-[#E63946] text-white"
              onClick={() => router.push('/teaser')}
            >
              Ajouter Mon Teaser
            </button>
          </div>

          {/* Boutons de navigation / Sauvegarde */}
          <div className="flex justify-between mt-6">
            <div className="flex space-x-4">
              <button 
                type="button"
                className="btn btn-circle bg-gray-300 text-white"
                onClick={() => router.push('/')}
              >
                <span className="material-icons">home</span>
              </button>
              <button
                type="button"
                className="btn btn-circle bg-gray-300 text-white"
                onClick={handleDeleteClick}
              >
                <span className="material-icons">delete_forever</span>
              </button>
            </div>
            <button
              type="button"
              className={`btn btn-circle text-white ${
                !isFormValid() || saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#E63946] hover:bg-[#d62828]'
              }`}
              onClick={handleSaveProfile}
              disabled={!isFormValid() || saving}
            >
              {saving ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <span className="material-icons">check</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modale de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>Êtes-vous sûr de vouloir supprimer votre profil ? Cette action est irréversible.</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn bg-gray-300 text-black mr-2"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn bg-red-500 text-white"
                onClick={handleDeleteProfile}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
