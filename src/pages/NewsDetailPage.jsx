import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { BiArrowBack, BiShareAlt, BiCopy } from 'react-icons/bi';
import { FaFacebookF, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function NewsDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextNews, setNextNews] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
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

  useEffect(() => {
    if (!loadingRef.current || isLoadingNext) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && nextNews) {
          setIsLoadingNext(true);
          try {
            // Pre-fetch next article data
            const nextData = await apiService.getNewsBySlug(nextNews.slug);
            const nextNewsData = await apiService.getNextNews(nextNews.slug);
            
            // Update URL and push to history
            navigate(`/noticias/${nextNews.slug}`, { 
              replace: true,
              state: { scrollPosition }
            });
            
            // Update state with new data
            setNews(nextData);
            setNextNews(nextNewsData);
            
            // Scroll to top of new content smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (err) {
            console.error('Error loading next news:', err);
            toast.error('Error al cargar la siguiente noticia');
          } finally {
            setIsLoadingNext(false);
          }
        }
      },
      { threshold: 0.95, rootMargin: '100px' }
    );

    observer.observe(loadingRef.current);
    return () => observer.disconnect();
  }, [nextNews, navigate, scrollPosition]);

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

  useEffect(() => {
    loadNews(slug);
  }, [slug, loadNews]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextNews) {
          navigate(`/noticias/${nextNews.slug}`, { replace: true });
        }
      },
      { threshold: 0.8 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [nextNews, navigate]);

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
          <div className="max-w-4xl mx-auto px-4 relative">
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
            className="fixed top-20 left-4 md:left-8 z-10 group flex items-center gap-3 px-4 py-3 bg-black/80 hover:bg-primary backdrop-blur-lg rounded-xl text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-primary/25"
            aria-label="Volver a noticias"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
              <BiArrowBack className="w-5 h-5 transform transition-transform group-hover:-translate-x-1" />
            </span>
            <span className="text-sm font-medium">Volver a noticias</span>
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="flex justify-end mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Compartir noticia"
                >
                  <BiShareAlt className="w-5 h-5 text-white" />
                </button>
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 p-2 bg-white/10 backdrop-blur-lg rounded-lg shadow-xl z-50"
                    >
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShare('facebook')}
                          className="p-2 rounded-full bg-[#1877f2] hover:bg-[#1877f2]/80 transition-colors"
                          aria-label="Compartir en Facebook"
                        >
                          <FaFacebookF className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="p-2 rounded-full bg-[#1da1f2] hover:bg-[#1da1f2]/80 transition-colors"
                          aria-label="Compartir en Twitter"
                        >
                          <FaTwitter className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="p-2 rounded-full bg-[#25d366] hover:bg-[#25d366]/80 transition-colors"
                          aria-label="Compartir en WhatsApp"
                        >
                          <FaWhatsapp className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
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
            className="prose prose-lg prose-invert max-w-none text-white"
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
      {nextNews && (
        <div ref={loadingRef} className="mt-8 text-center">
          <div className={`transition-opacity duration-300 ${isLoadingNext ? 'opacity-100' : 'opacity-0'}`}>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            <p className="text-gray-400 mt-2">Cargando siguiente noticia...</p>
          </div>
        </div>
      )}
    </article>
  );
}