import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "../lib/firebase";
import Loader from '../components/Loader';

const db = getFirestore(app);

const Tile: React.FC<{
  label: string;
  value: string;
  hasDot?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderSize?: string;
  onClick?: () => void;
}> = ({
  label,
  value,
  hasDot,
  backgroundColor = '#FFFFFF',
  textColor = '#E63946',
  borderColor = '#E63946',
  borderSize = '4px',
  onClick,
}) => {
  return (
    <div
      className="relative h-32 w-full rounded-3xl overflow-hidden cursor-pointer"
      style={{
        backgroundColor,
        color: textColor,
        borderStyle: 'solid',
        borderColor,
        borderWidth: borderSize,
      }}
      onClick={onClick}
    >
      {/* Barre de label moins large, centrée horizontalement */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-6 flex items-center justify-center rounded-b-3xl"
        style={{
          width: '80%', // 80% de la largeur de la tuile
          backgroundColor: borderColor,
        }}
      >
        <span className="text-sm font-medium text-white">{label}</span>
        {hasDot && (
          <span className="ml-2 w-2 h-2 rounded-full bg-green-500 inline-block" />
        )}
      </div>

      {/* Contenu principal (le nombre), avec un pt-6 pour laisser la place à la barre */}
      <div className="flex items-center justify-center h-full pt-6">
        <span className="text-7xl font-bold leading-none">{value}</span>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    firstName: '',
    age: '',
    city: '',
    imageURL: '',
  });
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleViewProfile = () => {
    if (user) {
      router.push(`/profileexplorer?id=${user.uid}`);
    }
  };

  const handleViewMatches = () => {
    router.push('/matchs');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileData(docSnap.data() as typeof profileData);
            setCompletionPercentage(docSnap.data().completionPercentage || 0);
          } else {
            console.log("Aucune donnée de profil trouvée !");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du profil :", error);
        }
      }
    };

    fetchProfileData();
  }, [user]);

  useEffect(() => {
    const fetchFavoriteCount = async () => {
      if (user) {
        const favoritesQuery = query(collection(db, 'favorites'), where('favoriteId', '==', user.uid));
        const querySnapshot = await getDocs(favoritesQuery);
        setFavoriteCount(querySnapshot.size);
      }
    };

    fetchFavoriteCount();
  }, [user]);

  useEffect(() => {
    const fetchViewCount = async () => {
      if (user) {
        const viewsQuery = query(collection(db, 'profileViews'), where('profileId', '==', user.uid));
        const querySnapshot = await getDocs(viewsQuery);
        setViewCount(querySnapshot.size);
      }
    };

    fetchViewCount();
  }, [user]);

  useEffect(() => {
    const fetchMatchCount = async () => {
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
        setMatchCount(matchIds.length);
      }
    };

    fetchMatchCount();
    setLoadingData(false);
  }, [user]);

  if (loading || loadingData) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Image de fond */}
      <div
        className="flex-grow bg-cover bg-center relative"
        style={{ backgroundImage: `url(${profileData.imageURL})` }}
      >
        {/* Bouton icône en haut à gauche */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center text-[#D4AF37] hover:text-gray-700 transition duration-300 border border-[#D4AF37] rounded-full p-2 w-10 h-10"
          >
            <span className="material-icons text-2xl">logout</span>
          </button>
        </div>

        {/* Bouton icône "visibility" en haut à droite */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleViewProfile}
            className="flex items-center justify-center text-[#D4AF37] hover:text-gray-700 transition duration-300 border border-[#D4AF37] rounded-full p-2 w-10 h-10"
          >
            <span className="material-icons text-2xl">visibility</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-1/3"></div>
        <div className="absolute bottom-52 left-0 right-0 text-center">
          <h1 className="text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
            {profileData.firstName}, {profileData.age}.
          </h1>
          <p className="text-large font-regular text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
          {profileData.city}
        </p>
        </div>
        {/* Section Score */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-[#D4AF37] text-white py-2 px-4 rounded-full flex items-center space-x-2 border border-white">
          <span className="text-lg font-bold">{completionPercentage}%</span>
          <span className="text-medium">Profil complet</span>
        </div>
      </div>

      {/* Bloc blanc arrondi */}
      <div className="bg-white rounded-t-3xl p-6 -mt-16 z-10 relative mb-20">
        <div className="max-w-md mx-auto grid grid-cols-[60%_40%] gap-4 mb-4 justify-center">
          <Tile
            label="Vues"
            value={viewCount.toString()}
            backgroundColor="#EEE0E1"
            textColor="#FF5F6D"
            borderColor="#E63946"
          />
          <Tile
            label="Match"
            value={matchCount.toString()}
            backgroundColor="#FF5F6D"
            textColor="#FFFFFF"
            borderColor="#E63946"
            onClick={handleViewMatches}
          />
        </div>

        <div className="max-w-md mx-auto grid grid-cols-[40%_60%] gap-4 justify-center">
          <Tile
            label="Messages"
            value="--"
            hasDot
            backgroundColor="#FF5F6D"
            textColor="#FFFFFF"
            borderColor="#E63946"
          />
          <Tile
            label="Favoris"
            value={favoriteCount.toString()}
            backgroundColor="#EEE0E1"
            textColor="#FF5F6D"
            borderColor="#E63946"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
