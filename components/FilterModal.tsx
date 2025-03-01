import React, { useState, useEffect } from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const interestsList = [
  "Art", "Astronomie", "Bricolage", "Cinéma", "Cuisine", "Danse", "Écriture", "Escalade", "Fitness", "Football",
  "Gaming", "Gastronomie", "Golf", "Jardinage", "Lecture", "Musique", "Natation", "Peinture", "Photographie", "Piano",
  "Randonnée", "Running", "Sculpture", "Ski", "Surf", "Tennis", "Théâtre", "Voyages", "Yoga", "Zumba",
  "Basketball", "Boxe", "Chant", "Cyclisme", "Dessin", "Équitation", "Escrime", "Informatique", "Judo", "Karaté",
  "Kitesurf", "Langues", "Méditation", "Mode", "Pêche", "Plongée", "Rugby", "Scrabble", "Snowboard", "Voile"
].sort();

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState({ min: 18, max: 99 });
  const [gender, setGender] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      if (cityQuery.length > 2) { // Limiter les requêtes pour des saisies significatives
        try {
          const response = await fetch(`https://geo.api.gouv.fr/communes?nom=${cityQuery}&fields=nom,code,codeDepartement&limit=10`);
          const data = await response.json();
          setCitySuggestions(data);
        } catch (error) {
          console.error('Erreur lors de la récupération des villes:', error);
        }
      } else {
        setCitySuggestions([]);
      }
    };

    const debounceFetch = setTimeout(fetchCities, 300); // Debounce de 300ms
    return () => clearTimeout(debounceFetch);
  }, [cityQuery]);

  const handleInterestChange = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityQuery(e.target.value);
    setIsTyping(true);
  };

  const handleCitySelect = (city: any) => {
    setCityQuery(city.nom);
    setCitySuggestions([]);
    setIsTyping(false);
  };

  const handleApply = () => {
    onApply({ interests: selectedInterests, ageRange, gender, relationshipType });
    onClose();
  };

  const handleReset = () => {
    setSelectedInterests([]);
    setAgeRange({ min: 18, max: 99 });
    setGender('');
    setRelationshipType('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-h-[70vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Filtres</h2>
        
        {/* Champ de recherche de ville */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Ville</h3>
          <input
            type="text"
            value={cityQuery}
            onChange={handleCityInputChange}
            className="input input-bordered w-full bg-gray-50 border-gray-300 text-gray-700"
            placeholder="Rechercher une ville"
          />
          {citySuggestions.length > 0 && isTyping && cityQuery.length > 2 && (
            <ul className="bg-white border border-gray-300 mt-2 rounded-md shadow-lg">
              {citySuggestions.map((city) => (
                <li
                  key={city.code}
                  onClick={() => handleCitySelect(city)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {city.nom} ({city.codeDepartement})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Genre */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Genre</h3>
          <select
            className="select select-bordered w-full bg-gray-50 border-gray-300 text-gray-700"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Peu importe</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
            <option value="Non-binaire">Non-binaire</option>
          </select>
        </div>

        {/* Type de Relation */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Type de Relation</h3>
          <select
            className="select select-bordered w-full bg-gray-50 border-gray-300 text-gray-700"
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
          >
            <option value="">---</option>
            <option value="Relation amoureuse / sérieuse">Relation amoureuse / sérieuse</option>
            <option value="Rencontre casual / sans prise de tête">Rencontre casual / sans prise de tête</option>
            <option value="Amitié">Amitié</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Centres d'intérêts */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Centres d'intérêts (jusqu'à 5) <span className="text-xs text-gray-500">({selectedInterests.length}/5)</span>
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {interestsList.map(interest => (
              <button
                key={interest}
                onClick={() => handleInterestChange(interest)}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${
                  selectedInterests.includes(interest) ? 'bg-[#E63946] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Préférences d'âges */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Préférences d'âges</h3>
          <div className="flex space-x-2">
            <select
              className="select select-bordered w-1/2 bg-gray-50 border-gray-300 text-gray-700"
              value={ageRange.min}
              onChange={(e) => setAgeRange({ ...ageRange, min: parseInt(e.target.value) })}
            >
              {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
            <select
              className="select select-bordered w-1/2 bg-gray-50 border-gray-300 text-gray-700"
              value={ageRange.max}
              onChange={(e) => setAgeRange({ ...ageRange, max: parseInt(e.target.value) })}
            >
              {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button onClick={handleApply} className="btn bg-[#E63946] text-white border-gray-300">Appliquer</button>
          <button onClick={handleReset} className="btn bg-gray-300 text-white border-gray-300">
            <span className="material-icons">delete</span>
          </button>
          <button onClick={onClose} className="btn bg-[#D4AF37] text-white border-gray-300">Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal; 