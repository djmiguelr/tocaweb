import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { motion } from 'framer-motion';
import { BiTime, BiChevronRight, BiNews } from 'react-icons/bi';

function NewsCard({ news }) {
  return (
    <div className="bg-[#1C1C1C] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={news.attributes.Imagendestacada?.url}
          alt={news.attributes.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full">
          <span className="text-sm text-white font-medium">
            {news.attributes.categoría}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl text-white font-bold mt-2 line-clamp-2 group-hover:text-primary transition-colors">
          {news.attributes.title}
        </h3>
        <p className="text-sm text-gray-400 mt-2">
          {new Date(news.attributes.Fechapublicacion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}

export function NewsPage() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Entretenimiento', 'Nacional', 'Deportes', 'Mundo'];

  useEffect(() => {
    const loadNews = async () => {
      try {
        setIsLoading(true);
        let data;
        
        if (selectedCategory === 'Todos') {
          data = await apiService.getNews();
        } else {
          data = await apiService.getNewsByCategory(selectedCategory);
        }

        console.log('Noticias cargadas:', data);
        if (Array.isArray(data)) {
          const sortedNews = data.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
          setNews(sortedNews);
        } else {
          setNews([]);
        }
      } catch (err) {
        console.error('Error cargando noticias:', err);
        setError('Error al cargar las noticias');
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
            Noticias
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Mantente informado con las últimas noticias y acontecimientos más relevantes
          </p>
        </header>

        <nav className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-3 md:gap-4 md:justify-center min-w-max">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full transition-all transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {news.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
            >
              <Link to={`/noticias/${item.slug}`} className="block">
                <div className="relative aspect-[16/9] overflow-hidden">
                  {item.imagen?.url ? (
                    <img
                      src={item.imagen.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <BiNews className="w-12 h-12 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full shadow-lg">
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
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 line-clamp-3">
                    {item.contenido.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {news.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="bg-white/5 rounded-2xl p-8 max-w-2xl mx-auto">
              <BiNews className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">
                No hay noticias disponibles en esta categoría.
              </p>
              <button
                onClick={() => setSelectedCategory('Todos')}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
              >
                Ver todas las noticias
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}