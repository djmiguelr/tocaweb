import React, { useState, useEffect } from 'react';
import { useCity } from '../context/CityContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { constants } from '../services/api';

export function LivePage() {
  const { selectedCity } = useCity();
  const [liveData, setLiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchLiveData = async () => {
      if (!selectedCity) return;

      setIsLoading(true);
      setError(null);

      try {
        const documentId = selectedCity.documentId || selectedCity.id;
        const response = await axios.get(`${constants.API_BASE}/ciudades/${documentId}?populate[Live][populate]=*`);
        const cityData = response.data.data;
        
        // Extract all available data from the response
        const cityAttributes = cityData?.attributes || {};
        const liveAttributes = cityAttributes?.Live?.data?.[0]?.attributes || {};
        
        // Set live data with enhanced information
        setLiveData({
          titulo: liveAttributes.titulo || cityAttributes.nombre || selectedCity.name || 'Transmisión en vivo',
          descripcion: liveAttributes.descripcion || cityAttributes.descripcion || `Transmisión en vivo desde ${selectedCity.name}`,
          url: liveAttributes.url || '',
          frequency: cityAttributes.frequency || selectedCity.frequency,
          coverImage: cityAttributes.cover?.data?.attributes?.url || selectedCity.cover_url,
          status: liveAttributes.status || 'offline',
          schedule: liveAttributes.schedule || null
        });

        // Show informative message if live stream is not available
        if (!liveAttributes.url) {
          setError('En este momento no hay transmisión en vivo. Vuelve más tarde para disfrutar del contenido en directo.');
        }
      } catch (err) {
        console.error('Error fetching live data:', err);
        setError('Error al cargar la transmisión en vivo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveData();
  }, [selectedCity]);

  if (!selectedCity) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Selecciona una ciudad</h1>
          <p className="text-gray-400">Elige una ciudad para ver las transmisiones en vivo disponibles</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-b from-black via-black/95 to-black/90">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="animate-pulse"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white/10 rounded-full" />
              <div>
                <div className="h-6 bg-white/10 rounded w-48 mb-2" />
                <div className="h-4 bg-white/10 rounded w-32" />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-white/10 rounded-2xl mb-8 overflow-hidden shadow-lg" />
              <div className="absolute top-4 right-4">
                <div className="h-6 bg-white/10 rounded-full w-24" />
              </div>
            </div>
            <div className="space-y-4 max-w-2xl">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-2/3" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Enhanced header with more information */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              {liveData?.coverImage && (
                <img 
                  src={liveData.coverImage}
                  alt={liveData.titulo}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {liveData?.titulo || selectedCity?.name || 'Transmisión en vivo'}
                </h1>
                {liveData?.frequency && (
                  <div className="text-primary font-medium mb-2">
                    {liveData.frequency}
                  </div>
                )}
                <p className="text-gray-400 text-lg">
                  {liveData?.descripcion || `Transmisión en vivo desde ${selectedCity?.name || 'nuestra ciudad'}`}
                </p>
              </div>
            </div>
            {liveData?.schedule && (
              <div className="bg-white/5 rounded-lg p-4 mt-4">
                <h2 className="text-white font-medium mb-2">Horario de transmisión</h2>
                <p className="text-gray-400">{liveData.schedule}</p>
              </div>
            )}
          </header>

          {/* Only show video container if URL is available */}
          {liveData?.url && (
            <div className="relative">
              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl mb-8">
                <iframe
                  src={liveData.url}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="Facebook Live Video"
                  className="w-full h-full"
                />
              </div>

              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500 text-white text-sm font-medium">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  En vivo
                </span>
              </div>
            </div>
          )}

          {/* Show error message if present */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📺</span>
                  </div>
                  <p className="text-white/80 font-medium text-lg mb-2">{error}</p>
                  {liveData?.schedule && (
                    <p className="text-white/60 text-sm">
                      Próxima transmisión: {liveData.schedule}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Actualizar página
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}