import React, { useState, useEffect } from 'react';
import { useCity } from '../context/CityContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { constants } from '../services/api';
import { SEO } from '../components/SEO';
import { FaFacebook, FaTwitter, FaWhatsapp, FaShareAlt } from 'react-icons/fa';

export function LivePage() {
  const { selectedCity } = useCity();
  const [liveData, setLiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    const shareTitle = liveData?.titulo || `Transmisión en vivo - ${selectedCity?.name}`;
    const shareText = liveData?.descripcion || `Transmisión en vivo desde ${selectedCity?.name}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareText}\n${shareUrl}`)}`, '_blank');
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
          });
        }
    }
  };

  useEffect(() => {
    const fetchLiveData = async () => {
      if (!selectedCity) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${constants.API_BASE}/ciudades/${selectedCity.documentId}`, {
          params: {
            'populate[Live][fields]': 'titulo,descripcion,url',
            'populate[Live][populate]': '*',
            'fields': 'name,frequency'
          }
        });

        const cityData = response.data.data;
        if (!cityData) {
          throw new Error('Ciudad no encontrada');
        }

        const liveData = cityData.attributes.Live?.data?.[0]?.attributes;
        
        setLiveData({
          titulo: liveData?.titulo || `Transmisión en vivo - ${selectedCity.name}`,
          descripcion: liveData?.descripcion || `Transmisión en vivo desde ${selectedCity.name}`,
          url: liveData?.url || null,
          frequency: cityData.attributes.frequency
        });

        if (!liveData?.url) {
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
      <>
        <SEO 
          title="Transmisión en Vivo - Toca Stereo"
          description="Selecciona tu ciudad para disfrutar de nuestra transmisión en vivo. Música, entretenimiento y contenido exclusivo en tiempo real."
          type="website"
        />
        <div className="min-h-screen pt-20 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Selecciona una ciudad</h1>
            <p className="text-gray-400">Elige una ciudad para ver las transmisiones en vivo disponibles</p>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <SEO 
          title={`Transmisión en Vivo ${selectedCity?.name ? `- ${selectedCity.name}` : ''} - Toca Stereo`}
          description={`Sintoniza nuestra transmisión en vivo desde ${selectedCity?.name || 'tu ciudad'}. Disfruta de la mejor música y contenido en ${selectedCity?.frequency || 'tu frecuencia local'}.`}
          type="website"
        />
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
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO 
          title={`Transmisión en Vivo ${selectedCity?.name ? `- ${selectedCity.name}` : ''} - Toca Stereo`}
          description={`Sintoniza nuestra transmisión en vivo desde ${selectedCity?.name || 'tu ciudad'}. Disfruta de la mejor música y contenido en ${selectedCity?.frequency || 'tu frecuencia local'}.`}
          type="website"
        />
        <div className="min-h-screen pt-20 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${liveData?.titulo || `Transmisión en Vivo - ${selectedCity?.name}`} - Toca Stereo`}
        description={liveData?.descripcion || `Sintoniza nuestra transmisión en vivo desde ${selectedCity?.name}. Disfruta de la mejor música y contenido en ${selectedCity?.frequency}.`}
        type="website"
        image={liveData?.coverImage}
      />
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Enhanced header with more information */}
            <header className="mb-8">
              <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold text-white">
                  {liveData?.titulo || selectedCity?.name || 'Transmisión en vivo'}
                </h1>
                <p className="text-gray-400 text-lg">
                  {liveData?.descripcion || `Transmisión en vivo desde ${selectedCity?.name || 'nuestra ciudad'}`}
                </p>
                {liveData?.frequency && (
                  <div className="text-primary font-medium">
                    {liveData.frequency}
                  </div>
                )}
              </div>
            </header>

            {/* Video container and share buttons */}
            {liveData?.url && (
              <div className="relative">
                <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl mb-8">
                  <iframe
                    src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(liveData.url)}&show_text=false&t=0`}
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

                {/* Share buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                    aria-label="Compartir en Facebook"
                  >
                    <FaFacebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full transition-colors"
                    aria-label="Compartir en Twitter"
                  >
                    <FaTwitter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                    aria-label="Compartir en WhatsApp"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare()}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full transition-colors"
                    aria-label="Más opciones para compartir"
                  >
                    <FaShareAlt className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500 text-white text-sm font-medium">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    En vivo
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}