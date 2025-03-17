import { useCity } from '../context/CityContext';
import { usePlayer } from '../context/PlayerContext';
import { TocaExitosSection } from '../components/Home/TocaExitosSection';
import { Link } from 'react-router-dom';
import { BiPlay, BiPause } from 'react-icons/bi';
import { MainSlider } from '../components/Home/MainSlider';
import { memo } from 'react';
import { EntrevistasSection } from '../components/Home/EntrevistasSection';
import { LocutoresSection } from '../components/Home/LocutoresSection';
import { SEO } from '../components/SEO';
import { NewsSection } from '../components/News/NewsSection';

const HomePageComponent = memo(function HomePageComponent() {
  const { selectedCity, isLoading, error } = useCity();
  const { isPlaying, playLiveStream, togglePlay } = usePlayer();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <SEO 
        title={selectedCity ? `Radio ${selectedCity.name}` : "Toca Stereo"}
        description={selectedCity 
          ? `Escucha Toca Stereo ${selectedCity.name} en ${selectedCity.frequency}. La mejor música las 24 horas del día.`
          : "Toca Stereo - La mejor música y contenido. Escucha las mejores mezclas y programación musical las 24 horas del día."}
      />
      
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-8 space-y-8 relative z-0">
        <MainSlider />

        {/* Sección de Noticias */}
        <section className="w-full py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">
                Últimas Noticias
              </h2>
              <Link
                to="/noticias"
                className="text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-2"
              >
                Ver todas
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            
            <NewsSection />
          </div>
        </section>

        {!selectedCity ? (
          <div className="bg-[#1C1C1C] rounded-xl p-6 text-center">
            <h2 className="text-xl text-white mb-2">
              Selecciona una ciudad para comenzar
            </h2>
            <p className="text-gray-400">
              Elige tu ciudad para ver el contenido personalizado
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="bg-gradient-to-r from-primary/20 to-[#1C1C1C] rounded-xl p-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Bienvenido a {selectedCity.name}
                </h1>
                <p className="text-xl text-gray-300 mb-6">
                  {selectedCity.frequency} - La mejor música las 24 horas
                </p>
                <button 
                  onClick={() => {
                    if (!isPlaying) {
                      playLiveStream(selectedCity);
                    } else {
                      togglePlay();
                    }
                  }} 
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all"
                >
                  {isPlaying ? (
                    <BiPause className="w-6 h-6" />
                  ) : (
                    <BiPlay className="w-6 h-6" />
                  )}
                  <span>{isPlaying ? 'Pausa' : 'Escuchar ahora'}</span>
                </button>
              </div>
            </section>

            <section>
              <TocaExitosSection />
            </section>

            <section className="bg-[#1C1C1C] rounded-xl p-6">
              <EntrevistasSection />
            </section>

            <section className="bg-[#1C1C1C] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Nuestros Locutores</h2>
              </div>
              <LocutoresSection />
            </section>
          </div>
        )}
      </div>
    </>
  );
});

export const HomePage = memo(HomePageComponent);