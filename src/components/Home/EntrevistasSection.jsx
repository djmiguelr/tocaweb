import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BiChevronRight, BiPlay } from 'react-icons/bi';
import { apiService } from '../../services/api';

export function EntrevistasSection() {
  const [entrevistas, setEntrevistas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEntrevistas = async () => {
      try {
        const data = await apiService.getEntrevistas();
        setEntrevistas(data.slice(0, 4)); // Mostrar 4 en el home
      } catch (error) {
        console.error('Error cargando entrevistas:', error);
        setError('Error al cargar las entrevistas');
      } finally {
        setIsLoading(false);
      }
    };

    loadEntrevistas();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/5 rounded-xl overflow-hidden">
            <div className="aspect-video bg-white/10" />
            <div className="p-6 space-y-3">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Toca Entrevistas</h2>
        <Link 
          to="/entrevistas"
          className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
        >
          <span className="text-sm font-medium">Ver todas</span>
          <BiChevronRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="relative overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-x-visible">
        <div className="flex gap-4 snap-x snap-mandatory overflow-x-auto scrollbar-hide md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 lg:gap-8">
          {entrevistas.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-none w-[calc(50%-8px)] md:w-full group relative bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 snap-start"
            >
              <Link to={`/entrevistas/${item.slug}`} className="block">
                <div className="relative aspect-[9/16] overflow-hidden">
                  {item.portada?.url ? (
                    <img
                      src={item.portada.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <BiPlay className="w-12 h-12 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-center">
                      <h3 className="text-base md:text-lg font-bold text-white group-hover:text-primary transition-colors break-words">
                        {item.title}
                      </h3>
                      <div className="h-1 w-8 bg-primary mt-2 mx-auto transform origin-center scale-0 group-hover:scale-100 transition-transform"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform">
                      <BiPlay className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}