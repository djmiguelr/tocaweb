import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNewsByCategories } from '../services/newsApi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SEO } from '../components/SEO';

// Orden específico de categorías
const CATEGORY_ORDER = ['Entretenimiento', 'Nacional', 'Deportes', 'Mundo'];

export const NewsPage = () => {
  const [newsByCategory, setNewsByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNewsByCategories();
        
        // Ordenar las categorías según el orden especificado
        const sortedData = [...data].sort((a, b) => {
          const indexA = CATEGORY_ORDER.indexOf(a.category.name);
          const indexB = CATEGORY_ORDER.indexOf(b.category.name);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setNewsByCategory(sortedData);
      } catch (error) {
        console.error('Error al cargar las noticias:', error);
        setError('No se pudieron cargar las noticias');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo(0, 0);
  }, []);

  const NewsCard = ({ news }) => {
    const imageUrl = news.featured_image?.url;
    const authorName = news.author?.name;
    const authorSlug = news.author?.slug;
    const authorAvatar = news.author?.avatar?.url;

    const handleAuthorClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = `/autor/${authorSlug}`;
    };

    return (
      <Link
        to={`/noticias/${news.slug}`}
        className="group bg-[#1A1A1A] rounded-xl overflow-hidden hover:bg-[#242424] transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 hover:shadow-2xl"
      >
        {/* Imagen */}
        <div className="aspect-video relative overflow-hidden">
          {imageUrl && (
            <img
              src={imageUrl.startsWith('/') ? `https://api.voltajedigital.com${imageUrl}` : imageUrl}
              alt={news.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {news.categoria && (
            <div className="absolute top-3 left-3">
              <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                {news.categoria.name}
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6 flex flex-col flex-grow">
          <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {news.title}
          </h2>
          {news.excerpt && (
            <p className="text-gray-400 mb-4 line-clamp-2 text-sm">
              {news.excerpt}
            </p>
          )}
          
          {/* Autor y Fecha */}
          <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center">
              {authorAvatar && (
                <img
                  src={authorAvatar.startsWith('/') ? `https://api.voltajedigital.com${authorAvatar}` : authorAvatar}
                  alt={authorName}
                  className="w-8 h-8 rounded-full mr-2 object-cover ring-2 ring-primary/20"
                />
              )}
              {authorName && authorSlug ? (
                <button
                  onClick={handleAuthorClick}
                  className="hover:text-primary transition-colors duration-200"
                >
                  {authorName}
                </button>
              ) : (
                authorName && <span>{authorName}</span>
              )}
            </div>
            {news.published && (
              <time dateTime={news.published} className="text-gray-500">
                {format(new Date(news.published), "d MMM, yyyy", { locale: es })}
              </time>
            )}
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="container mx-auto px-4 py-24">
          <div className="animate-pulse space-y-16">
            {[1, 2].map((category) => (
              <div key={category} className="space-y-8">
                <div className="h-8 bg-gray-700 rounded w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((card) => (
                    <div key={card} className="bg-[#1A1A1A] rounded-xl overflow-hidden">
                      <div className="aspect-video bg-gray-700"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
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
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-4">¡Ups! Algo salió mal</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Noticias"
        description="Las últimas noticias de música, entretenimiento y cultura. Mantente informado con las noticias más recientes de Toca Stereo."
        url="/noticias"
        type="website"
        canonicalUrl="https://tocastereo.co/noticias"
      />
      
      <div className="min-h-screen bg-[#121212]">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/20 to-[#121212] pt-32 pb-16">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-center">
              Últimas Noticias
            </h1>
            <p className="text-xl text-gray-400 text-center max-w-2xl mx-auto">
              Mantente informado con las últimas noticias de música, entretenimiento y cultura
            </p>
          </div>
        </div>

        {/* News Sections */}
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-24">
            {newsByCategory.map(({ category, news }) => (
              <section key={category.id} className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <h2 className="text-3xl font-bold text-white">
                    {category.name}
                  </h2>
                  <Link
                    to={`/categoria/${category.slug}`}
                    className="text-primary hover:text-primary-hover transition-colors duration-200 flex items-center group"
                  >
                    Ver todas
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {news.map((item) => (
                    <NewsCard key={item.id} news={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
