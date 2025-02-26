import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const db = getFirestore(app);

const ProfileCard: React.FC<{ profile: any }> = ({ profile }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/profileexplorer?id=${profile.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-3xl shadow-md m-2 overflow-hidden border-4 cursor-pointer"
      style={{ borderColor: '#E63946', height: '250px' }}
    >
      <div
        className="relative h-full bg-cover bg-center flex flex-col justify-end"
        style={{
          backgroundImage: `url(${profile.imageURL})`,
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="relative text-white p-2 text-center" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)' }}>
          <h2 className="text-medium font-bold">{profile.firstName}, {profile.age}</h2>
          <p className="text-xs font-light text-gray-400">{profile.city}</p>
        </div>
      </div>
    </div>
  );
};

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(favoritesQuery);
        const favoriteIds = querySnapshot.docs.map(doc => doc.data().favoriteId);

        if (favoriteIds.length > 0) {
          const profilesQuery = query(collection(db, 'users'), where('__name__', 'in', favoriteIds));
          const profilesSnapshot = await getDocs(profilesQuery);
          const profilesData = profilesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setFavorites(profilesData);
        } else {
          setFavorites([]);
        }
      }
    };

    fetchFavorites();
  }, [user]);

  const handleBack = () => {
    router.push('/explorer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        <button onClick={handleBack} className="text-[#FF5F6D]">
          <span className="material-icons text-3xl">arrow_back_ios</span>
        </button>
        <h1 className="text-2xl font-bold text-center text-[#FF5F6D]">Mes Favoris</h1>
        <span className="text-xl font-bold text-[#FF5F6D]">{favorites.length}</span>
      </div>
      <div className="flex-grow flex items-center justify-center p-4 pb-24">
        {favorites.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>Vous n'avez aucun profil en favoris pour l'instant.</p><br /><p> N'hésitez pas à en retourner régulièrement sur la page Explorer et à utiliser les filtres.</p> <br />
            <p>Astuce : les profils encadré de rouge sont ceux que vous n'avez pas encore consulté.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {favorites.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage; 