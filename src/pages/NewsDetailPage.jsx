import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { BiArrowBack, BiShareAlt, BiCopy } from 'react-icons/bi';
import { FaFacebookF, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
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
      
      const response = await apiService.getNewsBySlug(newsSlug);
      console.log('API Response:', response);

      if (!response || typeof response !== 'object') {
        console.error('Invalid API response:', response);
        throw new Error('Error al cargar la noticia');
      }

      // Handle both direct response and nested data structure
      const newsData = response.data?.data || response;
      if (!newsData) {
        throw new Error('Noticia no encontrada');
      }

      const nextNewsData = await apiService.getNextNews(newsSlug);
      const relatedNewsData = await apiService.getRelatedNews(newsSlug);
      setRelatedNews(relatedNewsData || []);
      
      // Extract the news data with proper fallbacks
      const data = {
        id: newsData.id || newsData.documentId,
        title: newsData.title || newsData.attributes?.title,
        description: newsData.description || newsData.attributes?.description,
        contenido: newsData.contenido || newsData.attributes?.contenido || '',
        categoria: newsData.categoria || 
                  newsData.attributes?.categoria?.data?.attributes?.nombre || 
                  'General',
        imagen: newsData.imagen || 
                newsData.attributes?.imagen?.data?.attributes || 
                null,
        fecha: newsData.fecha || newsData.attributes?.fecha,
        slug: newsData.slug || newsData.attributes?.slug
      };
      
      console.log('Datos de noticia procesados:', data);

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
    <article className="min-h-screen pt-20 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4"
      >
        {/* Main content section */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="flex justify-between items-center mb-8">
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-all transform hover:-translate-x-2"
            >
              <BiArrowBack className="w-5 h-5" />
              <span>Volver a noticias</span>
            </Link>

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

          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {news.title}
            </h1>
            <p className="text-gray-400 text-lg">{news.description}</p>
          </header>

          {news.imagen?.url && (
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl mb-8">
              <img
                src={news.imagen.url}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg prose-invert max-w-none [&>p]:text-white [&>p]:mb-6">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {news.contenido}
            </ReactMarkdown>
          </div>

          {/* Related news section moved after content */}
          {relatedNews.length > 0 && (
            <section className="mt-16 border-t border-white/10 pt-16">
              <h2 className="text-3xl font-bold text-white mb-8">Noticias relacionadas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedNews.map((item, index) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Link to={`/noticias/${item.slug}`} className="block">
                      {item.imagen?.url && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={item.imagen.url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Loading indicator for next article */}
        {isLoadingNext && (
          <div ref={loadingRef} className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando siguiente artículo...</p>
          </div>
        )}
      </motion.div>
    </article>
  );
}

export default NewsDetailPage;