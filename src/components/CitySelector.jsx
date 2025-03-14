import React from 'react';
import { MdRadio } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import { useCity } from '../context/CityContext';

export function CitySelector({ onClose }) {
  const { selectedCity, cities, setSelectedCity } = useCity();

  const handleCityChange = (city) => {
    setSelectedCity(city);
    onClose();
  };

  return (
    <div className="bg-black/90 backdrop-blur-lg">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Elige tu ciudad</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-2 transition-colors"
          >
            <IoMdClose size={24} />
          </button>
        </div>
        
        <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => handleCityChange(city)}
              className={`p-4 rounded-xl flex items-center gap-4 transition-colors ${
                selectedCity?.id === city.id
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/20">
                {city.coverlog ? (
                  <img
                    src={city.coverlog.formats?.small?.url || city.coverlog.url}
                    alt={city.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={city.coverlog.formats?.small?.width || city.coverlog.width}
                    height={city.coverlog.formats?.small?.height || city.coverlog.height}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = city.coverlog.url;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MdRadio className="text-white/40" size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">{city.name}</h3>
                <p className="text-sm opacity-60">{city.frequency}</p>
              </div>
              {selectedCity?.id === city.id && (
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
