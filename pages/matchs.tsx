import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const db = getFirestore(app);

const MatchCard: React.FC<{ profile: any }> = ({ profile }) => {
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
          <div className="inline-block bg-gray-700 bg-opacity-50 text-white text-xs font-bold px-2 py-1 rounded-full mb-1 border border-gray-300">
            {profile.distance} km
          </div>
          <h2 className="text-medium font-bold">{profile.firstName}, {profile.age}</h2>
          <p className="text-xs font-light text-gray-400">{profile.city}</p>
        </div>
      </div>
    </div>
  );
};

const MatchsPage: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMatches = async () => {
      if (user) {
        // Récupérer les profils qui vous ont ajouté en favoris
        const favoritedByQuery = query(collection(db, 'favorites'), where('favoriteId', '==', user.uid));
        const favoritedBySnapshot = await getDocs(favoritedByQuery);
        const favoritedByIds = favoritedBySnapshot.docs.map(doc => doc.data().userId);

        // Récupérer les profils que vous avez ajoutés en favoris
        const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', user.uid));
        const favoritesSnapshot = await getDocs(favoritesQuery);
        const favoriteIds = favoritesSnapshot.docs.map(doc => doc.data().favoriteId);

        // Trouver les correspondances
        const matchIds = favoritedByIds.filter(id => favoriteIds.includes(id));

        if (matchIds.length > 0) {
          const profilesQuery = query(collection(db, 'users'), where('__name__', 'in', matchIds));
          const profilesSnapshot = await getDocs(profilesQuery);
          const profilesData = profilesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setMatches(profilesData);
        } else {
          setMatches([]);
        }
      }
    };

    fetchMatches();
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
        <h1 className="text-2xl font-bold text-center text-[#FF5F6D]">Mes Matchs</h1>
        <span className="text-xl font-bold text-[#FF5F6D]">{matches.length}</span>
      </div>
      <div className="flex-grow flex items-center justify-center p-4 pb-24">
        {matches.length === 0 ? (
          <div className="text-center text-gray-500">
            Vous n'avez aucun match pour l'instant. Si besoin, essayer d'améliorer votre profile et de tester un autre teaser. Et n'oubliez pas de laisser un peu de temps aux autres de vous trouver.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {matches.map(profile => (
              <MatchCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchsPage; 