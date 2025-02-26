import React from 'react';

const Tile: React.FC<{
  label: string;
  value: string;
  hasDot?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderSize?: string;
}> = ({
  label,
  value,
  hasDot,
  backgroundColor = '#FFFFFF',
  textColor = '#E63946',
  borderColor = '#E63946',
  borderSize = '4px',
}) => {
  return (
    <div
      className="relative h-32 w-full rounded-3xl overflow-hidden"
      style={{
        backgroundColor,
        color: textColor,
        borderStyle: 'solid',
        borderColor,
        borderWidth: borderSize,
      }}
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

const HomePage = () => {
  const profileImageUrl = '/portrait1.jpg'; 

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Image de fond */}
      <div
        className="flex-grow bg-cover bg-center relative"
        style={{ backgroundImage: `url(${profileImageUrl})` }}
      >
        {/* Bouton icône en haut à gauche */}
        <div className="absolute top-4 left-4 z-10">
          <button className="flex items-center justify-center text-[#D4AF37] hover:text-gray-700 transition duration-300 border border-[#D4AF37] rounded-full p-2 w-10 h-10">
            <span className="material-icons text-2xl">logout</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-1/3"></div>
        <div className="absolute bottom-52 left-0 right-0 text-center">
          <h1 className="text-4xl font-bold text-white">Pierre, 20</h1>
          <p className="text-lg text-gray-400">NICE</p>
        </div>
        {/* Section Score */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-[#D4AF37] text-white py-2 px-4 rounded-full flex items-center space-x-2 border border-white">
          <span className="text-lg font-bold">80%</span>
          <span className="text-lg">Profil complet</span>
        </div>
      </div>

      {/* Bloc blanc arrondi */}
      <div className="bg-white rounded-t-3xl p-6 -mt-16 z-10 relative mb-20">
        <div className="max-w-md mx-auto grid grid-cols-[60%_40%] gap-4 mb-4 justify-center">
          <Tile
            label="Vues"
            value="145"
            backgroundColor="#EEE0E1"
            textColor="#FF5F6D"
            borderColor="#E63946"
          />
          <Tile
            label="Match"
            value="7"
            backgroundColor="#FF5F6D"
            textColor="#FFFFFF"
            borderColor="#E63946"
          />
        </div>

        <div className="max-w-md mx-auto grid grid-cols-[40%_60%] gap-4 justify-center">
          <Tile
            label="Messages"
            value="20"
            hasDot
            backgroundColor="#FF5F6D"
            textColor="#FFFFFF"
            borderColor="#E63946"
          />
          <Tile
            label="Favoris"
            value="12"
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
