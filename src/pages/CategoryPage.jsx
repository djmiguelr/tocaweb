import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getNewsByCategory } from '../services/newsApi';
import { SEO } from '../components/SEO';
import { NewsCard } from '../components/News/NewsCard';
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

export const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchCategoryDetail = async () => {
      if (!slug) {
        navigate('/noticias');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getNewsByCategory(slug, currentPage);
        
        if (!response?.data) {
          throw new Error('No se pudo cargar la categoría');
        }

        const firstNews = response.data[0];
        setCategory({
          name: firstNews?.categoria?.name || 'Categoría',
          slug: firstNews?.categoria?.slug || slug,
          news: response.data
        });
        
        setTotalPages(response.meta?.pagination?.pageCount || 1);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError(error.message || 'No se pudieron cargar las noticias de esta categoría');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, currentPage, navigate]);

  const renderBackButton = () => (
    <Link
      to="/noticias"
      className="inline-flex items-center text-primary hover:text-primary-hover transition-colors duration-200 group absolute top-28 left-4 md:left-8"
    >
      <motion.div
        className="flex items-center"
        whileHover={{ x: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <svg className="w-5 h-5 mr-2 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Volver</span>
      </motion.div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] relative pt-24">
        {renderBackButton()}
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col items-center space-y-4 mb-12">
              <div className="h-12 bg-gray-700 rounded w-64"></div>
              <div className="h-6 bg-gray-700 rounded w-96 max-w-full"></div>
            </div>
            
            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-[#2C2C2C] rounded-lg shadow-md overflow-hidden transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="h-48 bg-gray-700 animate-pulse"></div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                      <div className="h-4 bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
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
      <div className="min-h-screen bg-[#121212] relative pt-24">
        {renderBackButton()}
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 max-w-2xl mx-auto"
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

  if (!category || !category.news?.length) {
    return (
      <div className="min-h-screen bg-[#121212] relative pt-24">
        {renderBackButton()}
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 max-w-2xl mx-auto"
          >
            <div className="inline-block p-4 rounded-full bg-blue-500/10 mb-4">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">No hay noticias</h2>
            <p className="text-gray-400">
              No se encontraron noticias en la categoría "{category?.name || 'seleccionada'}"
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${category.name} - Noticias`}
        description={`Lee las últimas noticias sobre ${category.name} en Toca Stereo. Mantente informado con las noticias más recientes de música, entretenimiento y cultura.`}
        url={`/categoria/${category.slug}`}
        type="website"
        canonicalUrl={`https://tocastereo.co/categoria/${category.slug}`}
      />

      <div className="min-h-screen bg-[#121212] relative pt-24">
        {renderBackButton()}
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 max-w-4xl mx-auto"
          >
            <motion.h1 
              className="text-5xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {category.name}
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Las últimas noticias sobre {category.name.toLowerCase()}
            </motion.p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {category.news.map((item) => (
              <motion.div 
                key={item.id} 
                variants={item}
                className="transform hover:scale-[1.02] transition-transform duration-300"
              >
                <NewsCard news={item} />
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-16 flex justify-center gap-3"
            >
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-hover transform hover:scale-105'
                }`}
              >
                Anterior
              </button>
              
              <div className="flex items-center gap-3">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-12 h-12 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === index + 1
                        ? 'bg-primary text-white transform scale-110'
                        : 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-105'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-hover transform hover:scale-105'
                }`}
              >
                Siguiente
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};
