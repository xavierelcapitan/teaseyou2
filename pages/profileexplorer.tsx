import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const db = getFirestore(app);

const ProfileExplorerPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        const docRef = doc(db, 'users', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile(data);
          console.log('Recording profile view for:', user?.uid, id);
          await recordProfileView(user?.uid, id as string);
        } else {
          console.log('No such document!');
        }
      }
    };

    const checkFavorite = async () => {
      if (user && id) {
        const favoriteRef = doc(db, 'favorites', `${user.uid}_${id}`);
        const favoriteSnap = await getDoc(favoriteRef);
        setIsFavorite(favoriteSnap.exists());
      }
    };

    fetchUser();
    checkFavorite();
  }, [id, user]);

  const recordProfileView = async (userId: string | undefined, profileId: string) => {
    if (userId) {
      const viewRef = doc(db, 'profileViews', `${userId}_${profileId}`);
      try {
        await setDoc(viewRef, { userId, profileId, viewed: true }, { merge: true });
        console.log('Profile view recorded');
      } catch (error) {
        console.error('Error recording profile view:', error);
      }
    }
  };

  const toggleFavorite = async () => {
    if (user && id) {
      const favoriteRef = doc(db, 'favorites', `${user.uid}_${id}`);
      if (isFavorite) {
        await deleteDoc(favoriteRef);
      } else {
        await setDoc(favoriteRef, { userId: user.uid, favoriteId: id });
      }
      setIsFavorite(!isFavorite);
    }
  };

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div
        className="flex-grow bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${userProfile.imageURL})`,
          height: '300px',
          width: '100%',
        }}
      >
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center text-[#D4AF37] hover:text-gray-700 transition duration-300 border border-[#D4AF37] rounded-full p-2 w-10 h-10"
          >
            <span className="material-icons text-2xl">arrow_back</span>
          </button>
        </div>

        {/* Icône de Favoris */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleFavorite}
            className={`flex items-center justify-center transition duration-300 border rounded-full p-2 w-10 h-10 ${
              isFavorite ? 'text-[#E63946] border-[#E63946]' : 'text-gray-400 border-gray-400'
            }`}
          >
            <span className="material-icons text-2xl">favorite</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-1/3"></div>
        <div className="absolute bottom-52 left-0 right-0 text-center">
          <h1 className="text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
            {userProfile.firstName}, {userProfile.age}.
          </h1>
          <p className="text-large font-regular text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
            {userProfile.city}
          </p>
          <p className="text-large font-regular text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
            {userProfile.gender}
          </p>
        </div>
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-[#D4AF37] text-white py-2 px-4 rounded-full flex items-center space-x-2 border border-white">
          <span className="text-lg font-bold">{userProfile.completionPercentage || 0}%</span>
          <span className="text-medium">Profil complet</span>
        </div>
      </div>

      {/* Bloc blanc arrondi */}
      <div className="bg-white rounded-t-3xl p-6 -mt-16 z-10 relative pb-20" style={{ height: '350px' }}>
        <div className="max-w-md mx-auto overflow-y-auto h-full">
          
          {/* Section "Je recherche" */}
          <div className="mt-1">
            <h3 className="text-2xl font-bold mb-4 text-gray-400">Je recherche</h3>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                <span className="material-icons mr-2">favorite</span>
                {userProfile.relationshipType}
              </div>
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                <span className="material-icons mr-2">diversity_1</span>
                {userProfile.partnerGender}
              </div>
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                <span className="material-icons mr-2">calendar_today</span>
                {userProfile.partnerAgeRange ? `${userProfile.partnerAgeRange.min} ans à ${userProfile.partnerAgeRange.max} ans` : 'Non spécifié'}
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-gray-400 mt-4">À propos de moi</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {userProfile.interests && userProfile.interests.sort().map((interest: string, index: number) => (
              <div
                key={interest}
                className="flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white"
                style={{
                  backgroundColor: index % 2 === 0 ? '#E63946' : '#FF5F6D', // Impairs : #E63946, Pairs : #FF5F6D
                }}
              >
                {interest}
              </div>
            ))}
          </div>
          <p className="text-lg mb-4 text-gray-400">{userProfile.bio}</p>

        </div>
      </div>
    </div>
  );
};

export default ProfileExplorerPage; 