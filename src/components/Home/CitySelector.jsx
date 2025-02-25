import { memo } from 'react';
import { useCity } from '../../context/CityContext';
import { BASE_URL } from '../../services/api';

const CitySelector = memo(({ onClose, variant = 'default' }) => {
  const { 
    selectedCity, 
    setSelectedCity,
    cities,
    setShowCitySelector
  } = useCity();

  const handleSelectCity = (city) => {
    if (!city) return;
    
    const processedCity = {
      id: city.id,
      documentId: city.documentId || `city-${city.id}`,
      name: city.name,
      frequency: city.frequency,
      stream_url: city.stream_url,
      coverlog: city.coverlog,
      logo: city.logo,
      Locutor: city.Locutor || [],
      Programa: city.Programa || [],
      Redes: city.Redes || [],
      TocaExitos: city.TocaExitos || []
    };

    setSelectedCity(processedCity);
    
    if (variant === 'player' && onClose) {
      onClose();
    }
  };

  if (!cities.length) {
    return null;
  }
    
  return (
    <div className="p-2">
      {cities.map((city) => (
        <button
          key={city.id}
          onClick={() => handleSelectCity(city)}
          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {city.coverlog?.url && (
            <img
              src={city.coverlog.url.startsWith('http') ? city.coverlog.url : `${BASE_URL}${city.coverlog.url}`}
              alt={city.name}
              className="w-8 h-8 rounded object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-cover.jpg';
              }}
            />
          )}
          <div className="text-left">
            <h3 className="text-white text-sm">{city.name}</h3>
            {city.frequency && (
              <p className="text-gray-400 text-xs">{city.frequency}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
});

CitySelector.displayName = 'CitySelector';

export { CitySelector };
export default CitySelector;