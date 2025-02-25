import { createContext, useContext, useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';

const CityContext = createContext();

const CityProvider = ({ children }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showCitySelector, setShowCitySelector] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(
          `${BASE_URL}/api/ciudades?populate=*&populate[TocaExitos][populate]=*&populate[coverlog][populate]=*&populate[logo][populate]=*&populate[Redes][populate]=*`
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const result = await response.json();
        const { data } = result;

        console.log('API Response:', result);

        if (!data) {
          console.error('No data received from API');
          throw new Error('No data received from API');
        }
        
        if (!Array.isArray(data)) {
          console.error('Invalid data format received from API:', data);
          throw new Error('Invalid data format received from API');
        }

        if (data.length === 0) {
          console.error('Empty cities array received from API');
          throw new Error('No cities available in the database');
        }

        console.log('Processing cities data:', data);
        const processedCities = data
          .filter(city => {
            if (!city || (!city.attributes && !city.name)) {
              console.warn('Invalid city data:', city);
              return false;
            }
            return true;
          })
          .map(city => {
            const attrs = city.attributes || city;
            const processedCity = {
              id: city.id,
              documentId: attrs.documentId || `city-${city.id}`,
              name: attrs.name || 'Ciudad sin nombre',
              frequency: attrs.frequency || '',
              stream_url: attrs.stream_url || '',
              coverlog: null,
              logo: null,
              Locutor: [],
              Programa: [],
              Redes: [],
              TocaExitos: [],
              apps: []
            };

            // Process coverlog
            if (attrs.coverlog?.data?.attributes?.url) {
              processedCity.coverlog = {
                url: attrs.coverlog.data.attributes.url.startsWith('http')
                  ? attrs.coverlog.data.attributes.url
                  : `${BASE_URL}${attrs.coverlog.data.attributes.url}`,
                documentId: attrs.coverlog.documentId || `coverlog-${city.id}`
              };
            }

            // Process logo
            if (attrs.logo?.data?.attributes?.url) {
              processedCity.logo = {
                url: attrs.logo.data.attributes.url.startsWith('http')
                  ? attrs.logo.data.attributes.url
                  : `${BASE_URL}${attrs.logo.data.attributes.url}`,
                documentId: attrs.logo.documentId || `logo-${city.id}`
              };
            }

            // Process Locutor
            if (Array.isArray(attrs.Locutor?.data)) {
              processedCity.Locutor = attrs.Locutor.data.map(locutor => ({
                id: locutor.id,
                ...locutor.attributes
              }));
            }

            // Process Programa
            if (Array.isArray(attrs.Programa?.data)) {
              processedCity.Programa = attrs.Programa.data.map(programa => ({
                id: programa.id,
                ...programa.attributes
              }));
            }

            // Process Redes
            if (Array.isArray(attrs.Redes?.data)) {
              processedCity.Redes = attrs.Redes.data.map(red => ({
                id: red.id,
                ...red.attributes
              }));
            }

            // Process TocaExitos
            if (Array.isArray(attrs.TocaExitos?.data)) {
              processedCity.TocaExitos = attrs.TocaExitos.data.map(exito => {
                const exitoData = {
                  id: exito.id,
                  ...exito.attributes,
                  cover: null,
                  song: null
                };

                if (exito.attributes?.cover?.data?.attributes?.url) {
                  exitoData.cover = {
                    url: exito.attributes.cover.data.attributes.url.startsWith('http')
                      ? exito.attributes.cover.data.attributes.url
                      : `${BASE_URL}${exito.attributes.cover.data.attributes.url}`,
                    documentId: exito.attributes.cover.documentId || `cover-${exito.id}`
                  };
                }

                if (exito.attributes?.song?.data?.attributes?.url) {
                  exitoData.song = {
                    url: exito.attributes.song.data.attributes.url.startsWith('http')
                      ? exito.attributes.song.data.attributes.url
                      : `${BASE_URL}${exito.attributes.song.data.attributes.url}`,
                    documentId: exito.attributes.song.documentId || `song-${exito.id}`
                  };
                }

                return exitoData;
              });
            }

            // Process apps
            if (Array.isArray(attrs.apps?.data)) {
              processedCity.apps = attrs.apps.data.map(app => ({
                id: app.id,
                ...app.attributes
              }));
            }

            return processedCity;
          });

        console.log('Setting processed cities:', processedCities);
        setCities(processedCities);

        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity) {
          try {
            const parsedCity = JSON.parse(savedCity);
            const cityExists = processedCities.some(city => city.id === parsedCity.id);
            if (cityExists) {
              setSelectedCity(parsedCity);
              setShowCitySelector(false);
            } else {
              localStorage.removeItem('selectedCity');
              setShowCitySelector(true);
            }
          } catch (error) {
            console.error('Error parsing saved city:', error);
            localStorage.removeItem('selectedCity');
            setShowCitySelector(true);
          }
        }
      } catch (error) {
        console.error('Error loading cities:', error);
        setError('Error al cargar las ciudades');
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem('selectedCity', JSON.stringify(selectedCity));
      setShowCitySelector(false);
    }
  }, [selectedCity]);

  const value = {
    cities,
    selectedCity,
    setSelectedCity,
    showCitySelector,
    setShowCitySelector,
    isLoading,
    error
  };

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
};

function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}

export { CityContext, CityProvider, useCity };