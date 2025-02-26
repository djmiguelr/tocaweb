import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

// Crear el contexto
const CityContext = createContext(null);

// Crear el hook personalizado
export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};

// Crear el Provider Component
export const CityProvider = ({ children }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showCitySelector, setShowCitySelector] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const citiesData = await apiService.getDefaultCities();
        setCities(citiesData);

        // Intentar cargar ciudad guardada
        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity) {
          try {
            const parsedCity = JSON.parse(savedCity);
            const cityExists = citiesData.find(city => city.id === parsedCity.id);
            if (cityExists) {
              setSelectedCity(cityExists);
              setShowCitySelector(false);
            }
          } catch (err) {
            localStorage.removeItem('selectedCity');
          }
        }
      } catch (err) {
        console.error('Error loading cities:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
  }, []);

  const handleCitySelection = (city) => {
    setSelectedCity(city);
    setShowCitySelector(false);
    localStorage.setItem('selectedCity', JSON.stringify(city));
  };

  return (
    <CityContext.Provider 
      value={{
        cities,
        selectedCity,
        setSelectedCity: handleCitySelection,
        showCitySelector,
        setShowCitySelector,
        isLoading,
        error
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export default CityProvider;