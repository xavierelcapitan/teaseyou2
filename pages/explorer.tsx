import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import FilterModal from '../components/FilterModal';
import Loader from '../components/Loader';

const db = getFirestore(app);

const ProfileCard: React.FC<{ profile: any; isFavorite: boolean; isViewed: boolean }> = ({ profile, isFavorite, isViewed }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/profileexplorer?id=${profile.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-3xl shadow-md m-2 overflow-hidden border-4 cursor-pointer relative"
      style={{ borderColor: isViewed ? '#4A4A4A' : '#E63946', height: '250px' }}
    >
      {isFavorite && (
        <div className="absolute top-2 right-2 text-[#E63946] z-10">
          <span className="material-icons text-xl">favorite</span>
        </div>
      )}
      <div
        className="relative h-full bg-cover bg-center flex flex-col justify-end"
        style={{
          backgroundImage: `url(${profile.imageURL})`,
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-b-xl">
          {profile.percentage}%
        </div>
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

const ExplorerPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [viewedProfileIds, setViewedProfileIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(favoritesQuery);
        setFavoriteIds(querySnapshot.docs.map(doc => doc.data().favoriteId));
      }
    };

    const fetchProfiles = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const profilesData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          percentage: Math.floor(Math.random() * 21) + 80,
          distance: Math.floor(Math.random() * 200) + 1, // Exemple de distance aléatoire
        }))
        .filter(profile => profile.id !== user?.uid);

      setProfiles(profilesData);
      setFilteredProfiles(profilesData);
      setLoading(false);
    };

    const fetchViewedProfiles = async () => {
      if (user) {
        const viewsQuery = query(collection(db, 'profileViews'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(viewsQuery);
        setViewedProfileIds(querySnapshot.docs.map(doc => doc.data().profileId));
      }
    };

    fetchFavorites();
    fetchProfiles();
    fetchViewedProfiles();
  }, [user]);

  const handleFilters = () => {
    setIsFilterOpen(true);
  };

  const applyFilters = (filters: any) => {
    const filtered = profiles.filter(profile => {
      const matchesGender = filters.gender ? profile.gender === filters.gender : true;
      const matchesRelationship = filters.relationshipType ? profile.relationshipType === filters.relationshipType : true;
      const matchesInterests = filters.interests.length > 0 ? filters.interests.some((interest: string) => profile.interests?.includes(interest)) : true;
      const matchesAge = profile.age >= filters.ageRange.min && profile.age <= filters.ageRange.max;

      return matchesGender && matchesRelationship && matchesInterests && matchesAge;
    });

    setFilteredProfiles(filtered);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        <button onClick={() => router.push('/')} className="text-[#FF5F6D]">
          <span className="material-icons text-3xl">arrow_back_ios</span>
        </button>
        <h1 className="text-2xl font-bold text-center text-[#FF5F6D]">Explorer</h1>
        <button onClick={handleFilters} className="text-[#FF5F6D]">
          <span className="material-icons text-3xl">tune</span>
        </button>
      </div>
      <div className="flex-grow grid grid-cols-2 gap-4 gap-y-4 p-4 pb-24">
        {filteredProfiles.length === 0 ? (
          <div className="text-center text-gray-500 col-span-2">
            Aucun résultat, essayez d'autres filtres.
          </div>
        ) : (
          filteredProfiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isFavorite={favoriteIds.includes(profile.id)}
              isViewed={viewedProfileIds.includes(profile.id)}
            />
          ))
        )}
      </div>
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} onApply={applyFilters} />
    </div>
  );
};

export default ExplorerPage; 