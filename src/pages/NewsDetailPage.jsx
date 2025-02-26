import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { BiArrowBack } from 'react-icons/bi';

export function NewsDetailPage() {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      if (!slug) {
        setError('Slug no válido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Cargando noticia con slug:', slug);
        const data = await apiService.getNewsBySlug(slug);
        console.log('Datos de noticia recibidos:', data);

        if (!data) {
          throw new Error('Noticia no encontrada');
        }

        setNews(data);
      } catch (err) {
        console.error('Error cargando noticia:', err);
        setError(err.message || 'Error al cargar la noticia');
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, [slug]);

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4 w-1/3" />
            <div className="aspect-[21/9] bg-white/10 rounded mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-white/10 rounded w-1/4" />
              <div className="h-8 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
              <p className="text-red-500 font-medium">{error}</p>
              <Link
                to="/noticias"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mt-4"
              >
                <BiArrowBack className="w-5 h-5" />
                Volver a noticias
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar noticia
  if (!news) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-400">Noticia no encontrada</p>
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mt-4"
            >
              <BiArrowBack className="w-5 h-5" />
              Volver a noticias
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen pt-20 pb-12">
      {/* Hero section con imagen de fondo */}
      <div className="relative">
        {news.imagen?.url && (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={news.imagen.url}
                alt={news.title}
                className="w-full h-full object-cover filter blur-lg opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
            </div>
          </>
        )}

        <div className="container mx-auto px-4 relative">
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mb-8 transition-all transform hover:-translate-x-2"
          >
            <BiArrowBack className="w-5 h-5" />
            <span>Volver a noticias</span>
          </Link>

          <div className="max-w-4xl mx-auto">
            <header className="py-12 text-center">
              <span className="inline-block px-4 py-2 bg-primary text-white rounded-full mb-6 shadow-lg shadow-primary/25">
                {news.categoria}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {news.title}
              </h1>
              <time className="text-gray-400 text-lg">
                {new Date(news.fechaPublicacion).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </header>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          {news.imagen?.url && (
            <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-12 shadow-2xl">
              <img
                src={news.imagen.url}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div 
            className="prose prose-lg prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: news.contenido }}
          />

          {/* Navegación entre artículos */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex justify-between items-center">
              <Link
                to="/noticias"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
              >
                <BiArrowBack className="w-5 h-5" />
                Volver a noticias
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors"
              >
                Volver arriba
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}