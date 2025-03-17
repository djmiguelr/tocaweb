import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { NewsCard } from '../components/News/NewsCard';
import { getNewsByTag } from '../services/newsApi';
import { SEO } from '../components/SEO';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const TagPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tagName, setTagName] = useState('');
  const [tag, setTag] = useState({});

  useEffect(() => {
    const fetchNewsByTag = async () => {
      if (!slug) {
        navigate('/noticias');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('[TagPage] Fetching news for tag:', slug);
        const response = await getNewsByTag(slug);
        
        if (!response?.data || !Array.isArray(response.data)) {
          console.error('[TagPage] Invalid response:', response);
          throw new Error('No se pudieron cargar las noticias con este tag');
        }

        console.log('[TagPage] Received news:', response.data);

        const firstNewsWithTag = response.data.find(newsItem => 
          newsItem.tags?.some(tag => tag.slug === slug)
        );
        
        if (!firstNewsWithTag) {
          console.error('[TagPage] No news found with tag:', slug);
          throw new Error('No se encontraron noticias con este tag');
        }

        const tag = firstNewsWithTag.tags.find(tag => tag.slug === slug);
        if (!tag?.Nombre) {
          console.error('[TagPage] Tag not found in news:', { slug, firstNewsWithTag });
          throw new Error('Tag no encontrado');
        }

        setTagName(tag.Nombre);
        setTag(tag);
        setNews(response.data);
      } catch (error) {
        console.error('[TagPage] Error:', error);
        setError(error.message || 'No se pudieron cargar las noticias con este tag');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsByTag();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, navigate]);

  const renderBackButton = () => (
    <Link
      to="/noticias"
      className="inline-flex items-center text-primary hover:text-primary-hover transition-colors duration-200 group"
    >
      <motion.div
        className="flex items-center"
        whileHover={{ x: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <svg className="w-5 h-5 mr-2 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Volver a noticias</span>
      </motion.div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-8">{renderBackButton()}</nav>
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="h-10 bg-gray-700 rounded w-64"></div>
              <div className="h-6 bg-gray-700 rounded w-96"></div>
            </div>
            
            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-[#2C2C2C] rounded-lg shadow-md overflow-hidden"
                >
                  <div className="h-48 bg-gray-700 animate-pulse"></div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                      <div className="h-4 bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-700 rounded w-16"></div>
                      <div className="h-6 bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-8">{renderBackButton()}</nav>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-block p-4 rounded-full bg-red-500/10 mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Error al cargar las noticias</h2>
            <p className="text-red-400">{error}</p>
            <p className="text-gray-400 mt-2">Por favor, intenta nuevamente más tarde</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-8">{renderBackButton()}</nav>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-block p-4 rounded-full bg-blue-500/10 mb-4">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">No hay noticias</h2>
            <p className="text-gray-400">
              No se encontraron noticias con el tag "{tagName}"
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${tag.Nombre} - Noticias`}
        description={`Lee las últimas noticias etiquetadas con ${tag.Nombre} en Toca Stereo. Mantente informado con las noticias más recientes de música, entretenimiento y cultura.`}
        url={`/tag/${tag.slug}`}
        type="website"
        canonicalUrl={`https://tocastereo.co/tag/${tag.slug}`}
      />
      
      <div className="min-h-screen bg-[#121212]">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-8">{renderBackButton()}</nav>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col items-center text-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {tagName}
                </h1>
                <p className="text-gray-400 text-lg">
                  Todas las noticias relacionadas con {tagName}
                </p>
              </div>
            </div>

            <div className="flex justify-center items-center text-gray-400 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>{news.length} {news.length === 1 ? 'noticia encontrada' : 'noticias encontradas'}</span>
            </div>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {news.map((newsItem, index) => (
              <motion.div key={newsItem.id} variants={item}>
                <NewsCard news={newsItem} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
};
