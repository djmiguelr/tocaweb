import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BiPlay, BiArrowBack } from 'react-icons/bi';
import { apiService } from '../services/api';

export function EntrevistasPage() {
  const [entrevistas, setEntrevistas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const loadEntrevistas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiService.getEntrevistas();
        setEntrevistas(data || []);
      } catch (err) {
        console.error('Error cargando entrevistas:', err);
        setError('Error al cargar las entrevistas. Por favor, intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEntrevistas();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-black/0 via-black/5 to-black/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white/5 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[9/16] bg-white/10" />
                <div className="p-6">
                  <div className="h-6 bg-white/10 rounded mb-3" />
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-black/0 via-black/5 to-black/10">
        <div className="container mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center max-w-lg mx-auto">
            <p className="text-red-500 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-black/0 via-black/5 to-black/10">
      <div className="container mx-auto px-4">
        <header className="py-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent mb-4">
            Toca Entrevistas
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Conoce de cerca a tus artistas favoritos
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {entrevistas.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
            >
              <Link to={`/entrevistas/${item.slug}`} className="block">
                <div className="relative aspect-[9/16] overflow-hidden">
                  {item.portada?.url && (
                    <img
                      src={item.portada.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <BiPlay className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}