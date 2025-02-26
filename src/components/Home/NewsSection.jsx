import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api';
import { BiTime, BiChevronRight } from 'react-icons/bi';

export function NewsSection() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getNews();
        console.log('Noticias cargadas en sección:', data);
        if (Array.isArray(data) && data.length > 0) {
          setNews(data.slice(0, 6)); // Solo las 6 más recientes
        } else {
          setError('No hay noticias disponibles');
        }
      } catch (err) {
        console.error('Error cargando noticias:', err);
        setError('Error al cargar las noticias');
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/5 rounded-xl overflow-hidden">
            <div className="h-48 bg-white/10" />
            <div className="p-6 space-y-3">
              <div className="h-4 bg-white/10 rounded w-1/4" />
              <div className="h-6 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-xl p-6">
        <div className="flex flex-col items-center text-center">
          <p className="text-red-500 font-medium mb-2">
            Error al cargar las noticias
          </p>
          <p className="text-sm text-red-400">
            Por favor, intenta recargar la página
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center">
        <p className="text-gray-400">No hay noticias disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Últimas Noticias</h2>
        <Link 
          to="/noticias"
          className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
        >
          <span className="text-sm font-medium">Ver todas</span>
          <BiChevronRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors"
          >
            <Link to={`/noticias/${item.slug}`} className="block">
              <div className="relative h-48 overflow-hidden">
                {item.imagen?.url && (
                  <img
                    src={item.imagen.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                    {item.categoria}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                  <BiTime className="w-4 h-4" />
                  {item.fechaPublicacion ? (
                    new Date(item.fechaPublicacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  ) : 'Fecha no disponible'}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}