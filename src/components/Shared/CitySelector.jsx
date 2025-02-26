import { memo } from 'react';
import { useCity } from '../../context/CityContext';
import { motion } from 'framer-motion';

const CitySelector = memo(({ onClose, variant = 'default' }) => {
  const { cities, selectedCity, setSelectedCity } = useCity();

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', JSON.stringify(city));
    if (onClose) onClose();
  };

  if (!cities?.length) {
    return (
      <div className="text-center text-white text-lg">
        No hay ciudades disponibles
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {cities.map((city) => (
        <motion.button
          key={city.id}
          onClick={() => handleCitySelect(city)}
          className="group relative overflow-hidden rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
            {city.coverlog?.url ? (
              <img
                src={city.coverlog.url}
                alt={city.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/placeholder-city.jpg';
                }}
              />
            ) : (
              <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500">Sin imagen</span>
              </div>
            )}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">{city.name}</h3>
            <p className="text-primary">{city.frequency}</p>
          </div>

          {selectedCity?.id === city.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm">
              <span className="text-white font-bold text-lg">Ciudad Seleccionada</span>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
});

CitySelector.displayName = 'CitySelector';

export { CitySelector };
export default CitySelector;