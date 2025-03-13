import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BiChevronRight } from 'react-icons/bi';
import { TocaExitosCard } from '../Shared/TocaExitosCard';
import { useCity } from '../../context/CityContext';
import { apiService } from '../../services/api';

export function TocaExitosSection() {
  const [tocaExitos, setTocaExitos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedCity } = useCity();

  useEffect(() => {
    const fetchTocaExitos = async () => {
      if (!selectedCity?.documentId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const city = await apiService.getCity(selectedCity.documentId);
        if (city?.TocaExitos) {
          setTocaExitos(city.TocaExitos);
        } else {
          setTocaExitos([]);
        }
      } catch (error) {
        console.error('Error fetching Toca Éxitos:', error);
        setError('Error cargando Toca Éxitos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTocaExitos();
  }, [selectedCity?.documentId]);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-64 bg-white/5 rounded mt-2 animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-[160px] md:w-[200px] lg:w-[220px] aspect-[3/4] bg-white/5 rounded-xl animate-pulse flex-shrink-0" 
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!tocaExitos.length) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Toca Éxitos</h2>
          </div>
          <Link 
            to="/toca-exitos"
            className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
          >
            Ver todo
            <BiChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
            {tocaExitos.slice(0, 5).map((track, index) => (
              <div 
                key={track.documentId} 
                className="w-[160px] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)] flex-shrink-0 snap-start"
              >
                <TocaExitosCard
                  track={track}
                  rank={index + 1}
                  variant="vertical"
                />
              </div>
            ))}
          </div>
          
          {/* Gradient overlay for scroll indication */}
          <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-black to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
