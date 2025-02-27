import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { BiArrowBack, BiShareAlt, BiCopy } from 'react-icons/bi';
import { FaFacebookF, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { RelatedNewsSection } from '../components/News/RelatedNewsSection';

export function NewsDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextNews, setNextNews] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [relatedNews, setRelatedNews] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const articleRef = useRef(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  // Save scroll position before navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position on back navigation
  useEffect(() => {
    const handlePopState = () => {
      if (scrollPosition > 0) {
        window.scrollTo(0, scrollPosition);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [scrollPosition]);

  // Manage loaded articles cache
  const [loadedArticles, setLoadedArticles] = useState([]);
  const maxCachedArticles = 3; // Maximum number of articles to keep in memory

  // Update document title and metadata
  useEffect(() => {
    if (news?.title) {
      document.title = `${news.title} - Toca Stereo`;
      // Update meta tags
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', news.description || '');
      }
    }
    return () => {
      document.title = 'Toca Stereo';
    };
  }, [news]);

  // Enhanced intersection observer for infinite scroll
  useEffect(() => {
    if (!loadingRef.current || isLoadingNext) return;

    const options = {
      root: null,
      rootMargin: '200px', // Increased margin for earlier preloading
      threshold: 0.5 // Lower threshold for smoother transitions
    };

    const observer = new IntersectionObserver(async (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && nextNews && !isLoadingNext) {
        setIsLoadingNext(true);
        try {
          const nextData = await apiService.getNewsBySlug(nextNews.slug);
          const nextNewsData = await apiService.getNextNews(nextNews.slug);
          
          if (!nextData) {
            throw new Error('No se pudo cargar la siguiente noticia');
          }

          // Update URL and state only after successful data fetch
          window.history.replaceState(
            { 
              scrollPosition: window.scrollY,
              newsData: nextData // Store article data in history state
            },
            '',
            `/noticias/${nextNews.slug}`
          );
          
          // Update loaded articles cache
          setLoadedArticles(prev => {
            const updated = [...prev, nextData];
            // Keep only the most recent articles
            return updated.slice(-maxCachedArticles);
          });

          setNews(nextData);
          setNextNews(nextNewsData);
          
          // Reset loading state after successful transition
          setIsLoadingNext(false);

          // Cleanup resources for old articles
          if (loadedArticles.length > maxCachedArticles) {
            const articlesToRemove = loadedArticles.slice(0, -maxCachedArticles);
            articlesToRemove.forEach(article => {
              if (article.imagen?.url) {
                // Remove image from browser cache if needed
                const img = new Image();
                img.src = article.imagen.url;
                img.onload = () => URL.revokeObjectURL(img.src);
              }
            });
          }
        } catch (err) {
          console.error('Error loading next news:', err);
          toast.error('Error al cargar la siguiente noticia');
          setIsLoadingNext(false);
        }
      }
    }, options);

    observer.observe(loadingRef.current);
    return () => observer.disconnect();
  }, [nextNews, isLoadingNext, loadedArticles]);

  const loadNews = useCallback(async (newsSlug) => {
    if (!newsSlug) {
      setError('Slug no válido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiService.getNewsBySlug(newsSlug);
      const nextNewsData = await apiService.getNextNews(newsSlug);
      const relatedNewsData = await apiService.getRelatedNews(newsSlug);
      setRelatedNews(relatedNewsData || []);
      console.log('Datos de noticia recibidos:', data);

      if (!data) {
        throw new Error('Noticia no encontrada');
      }

      setNews(data);
      setNextNews(nextNewsData);
    } catch (err) {
      console.error('Error cargando noticia:', err);
      setError(err.message || 'Error al cargar la noticia');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remove duplicate navigation effect and scroll to top
  useEffect(() => {
    loadNews(slug);
    window.scrollTo(0, 0);
  }, [slug, loadNews]);

  // Enhanced scroll position restoration
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.scrollPosition) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: event.state.scrollPosition,
            behavior: 'auto'
          });
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextNews && !isLoadingNext) {
          setIsLoadingNext(true);
          loadNews(nextNews.slug);
        }
      },
      { threshold: 0.8 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [nextNews, isLoadingNext, loadNews]);

  // Pre-fetch next article
  useEffect(() => {
    if (nextNews && !isLoadingNext) {
      const prefetchNextArticle = async () => {
        try {
          await apiService.getNewsBySlug(nextNews.slug);
        } catch (err) {
          console.error('Error pre-fetching next article:', err);
        }
      };
      prefetchNextArticle();
    }
  }, [nextNews, isLoadingNext]);

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = news?.title;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Enlace copiado al portapapeles');
        } catch (err) {
          toast.error('Error al copiar el enlace');
        }
        break;
    }
    setShowShareMenu(false);
  };

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto px-4">
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mb-8 transition-all transform hover:-translate-x-2"
            >
              <BiArrowBack className="w-5 h-5" />
              <span>Volver a noticias</span>
            </Link>

            <div className="max-w-4xl mx-auto">
              <div className="flex justify-end mb-4">
                <div className="relative">
                  <button
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Compartir noticia"
                    disabled
                  >
                    <BiShareAlt className="w-5 h-5 text-white/50" />
                  </button>
                </div>
              </div>
              <header className="py-12 text-center animate-pulse">
                <div className="h-8 bg-white/10 w-32 mx-auto rounded-full mb-6" />
                <div className="h-12 bg-white/10 w-3/4 mx-auto rounded-lg mb-4" />
                <div className="h-12 bg-white/10 w-2/3 mx-auto rounded-lg mb-6" />
                <div className="h-6 bg-white/10 w-48 mx-auto rounded-lg" />
              </header>
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
    <article className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-black via-black/95 to-black/90">
      {/* Hero section with enhanced background handling */}
      <div className="relative min-h-[50vh] flex items-center justify-center">
        {news.imagen?.url && (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={news.imagen.url}
                alt={news.title}
                className="w-full h-full object-cover filter blur-lg opacity-20 transform scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
            </div>
          </>
        )}

        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced back button with better positioning and animation */}
          <Link
            to="/noticias"
            className="fixed top-24 left-4 md:left-8 z-10 group flex items-center gap-3 px-4 py-3 bg-black/90 hover:bg-primary backdrop-blur-lg rounded-xl text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-primary/25"
            aria-label="Volver a noticias"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
              <BiArrowBack className="w-5 h-5 transform transition-transform group-hover:-translate-x-1" />
            </span>
            <span className="text-sm font-medium">Volver a noticias</span>
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Enhanced share button with smoother animations */}
            <div className="flex justify-end mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors transform hover:scale-105 active:scale-95"
                  aria-label="Compartir noticia"
                >
                  <BiShareAlt className="w-5 h-5 text-white" />
                </button>
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 p-2 bg-black/90 backdrop-blur-lg rounded-lg shadow-xl z-50 border border-white/10"
                    >
                      <div className="flex gap-2">
                        {/* Enhanced share buttons with consistent styling */}
                        <button
                          onClick={() => handleShare('facebook')}
                          className="p-3 rounded-full bg-[#1877f2] hover:bg-[#1877f2]/80 transition-all duration-300 transform hover:scale-110 active:scale-95"
                          aria-label="Compartir en Facebook"
                        >
                          <FaFacebookF className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="p-3 rounded-full bg-[#1da1f2] hover:bg-[#1da1f2]/80 transition-all duration-300 transform hover:scale-110 active:scale-95"
                          aria-label="Compartir en Twitter"
                        >
                          <FaTwitter className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="p-3 rounded-full bg-[#25d366] hover:bg-[#25d366]/80 transition-all duration-300 transform hover:scale-110 active:scale-95"
                          aria-label="Compartir en WhatsApp"
                        >
                          <FaWhatsapp className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 transform hover:scale-110 active:scale-95"
                          aria-label="Copiar enlace"
                        >
                          <BiCopy className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Enhanced header with improved typography and spacing */}
            <motion.header 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="py-16 text-center"
            >
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-6 py-2 bg-primary text-white rounded-full mb-8 shadow-lg shadow-primary/25 transform hover:scale-105 transition-transform"
              >
                {news.categoria}
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight"
              >
                {news.title}
              </motion.h1>
              <motion.time 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 text-lg font-medium"
              >
                {new Date(news.fechaPublicacion).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </motion.time>
            </motion.header>
          </div>
        </div>
      </div>

      {/* Enhanced main content section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="container mx-auto px-4 mt-12"
      >
        <div className="max-w-4xl mx-auto">
          {news.imagen?.url && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="aspect-[21/9] rounded-2xl overflow-hidden mb-12 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
            >
              <img
                src={news.imagen.url}
                alt={news.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="prose prose-lg prose-invert max-w-none text-white/90 prose-headings:text-white prose-strong:text-white/90 prose-a:text-primary hover:prose-a:text-primary-hover prose-a:transition-colors prose-img:rounded-xl prose-img:shadow-xl"
            dangerouslySetInnerHTML={{ __html: news.contenido }}
          />

          {/* Enhanced navigation section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 pt-8 border-t border-white/10"
          >
            <div className="flex justify-between items-center">
              <Link
                to="/noticias"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors group"
              >
                <BiArrowBack className="w-5 h-5 transform transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">Volver a noticias</span>
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Volver arriba
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced related news section */}
      {relatedNews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <RelatedNewsSection relatedNews={relatedNews} />
        </motion.div>
      )}

      {/* Enhanced floating back-to-top button */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-4 bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
          aria-label="Volver arriba"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </motion.div>
    </article>
  );
}