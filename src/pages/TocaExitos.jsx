import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { BiMusic, BiPlay, BiTime } from 'react-icons/bi';
import { usePlayer } from '../context/PlayerContext';

export function TocaExitosPage() {
  const [tocaExitos, setTocaExitos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentTrack, playTrack } = usePlayer();

  useEffect(() => {
    const loadTocaExitos = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getTocaExitos();
        console.log('TocaExitos cargados:', data);
        if (Array.isArray(data) && data.length > 0) {
          setTocaExitos(data);
        } else {
          setError('No hay canciones disponibles');
        }
      } catch (err) {
        console.error('Error cargando TocaExitos:', err);
        setError('Error al cargar las canciones');
      } finally {
        setIsLoading(false);
      }
    };

    loadTocaExitos();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 rounded-xl overflow-hidden">
                <div className="aspect-square bg-white/10" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/4" />
                  <div className="h-6 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-full" />
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
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
              <p className="text-red-500 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Recargar página
              </button>
            </div>
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
            Toca Éxitos
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Descubre las canciones más populares del momento
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {tocaExitos.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
            >
              <div className="relative aspect-square overflow-hidden">
                {item.cover?.url ? (
                  <img
                    src={item.cover.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <BiMusic className="w-12 h-12 text-primary/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={() => playTrack(item)}
                  className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity ${
                    currentTrack?.id === item.id ? 'text-primary' : 'text-white'
                  }`}
                >
                  <BiPlay className="w-16 h-16" />
                </button>
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full shadow-lg">
                    #{item.rank}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 line-clamp-1">
                  {item.artist}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        {tocaExitos.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="bg-white/5 rounded-2xl p-8 max-w-2xl mx-auto">
              <BiMusic className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">
                No hay canciones disponibles en este momento.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}