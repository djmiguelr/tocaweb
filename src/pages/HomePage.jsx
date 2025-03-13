import { useCity } from '../context/CityContext';
import { TocaExitosSection } from '../components/Home/TocaExitosSection';
import { Link } from 'react-router-dom';
import { BiPlay } from 'react-icons/bi';
import { MainSlider } from '../components/Home/MainSlider';
import { NewsSection } from '../components/Home/NewsSection';
import { memo } from 'react';
import { EntrevistasSection } from '../components/Home/EntrevistasSection';
import { LocutoresSection } from '../components/Home/LocutoresSection';
import { SEO } from '../components/SEO';

const HomePageComponent = memo(function HomePageComponent() {
  const { selectedCity, isLoading, error } = useCity();

  // Agregar logs para debuggear
  console.log('HomePage render:', {
    selectedCity,
    isLoading,
    error
  });

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
          : "Toca Stereo - La mejor música y contenido. Escucha las mejores mezclas y mantente al día con las últimas noticias musicales."}
      />
      
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-8 space-y-8 relative z-0">
        <MainSlider />

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
          // Log para ver qué datos de la ciudad están disponibles
          console.log('Rendering city data:', selectedCity) || 
          <div className="space-y-8">
            <section className="bg-gradient-to-r from-primary/20 to-[#1C1C1C] rounded-xl p-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Bienvenido a {selectedCity.name}
                </h1>
                <p className="text-xl text-gray-300 mb-6">
                  {selectedCity.frequency} - La mejor música las 24 horas
                </p>
                <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all">
                  <BiPlay className="w-6 h-6" />
                  <span>Escuchar ahora</span>
                </button>
              </div>
            </section>

            <section>
              <TocaExitosSection />
            </section>

            <section className="bg-[#1C1C1C] rounded-xl p-6">
              <NewsSection />
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