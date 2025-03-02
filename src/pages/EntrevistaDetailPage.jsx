import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BiArrowBack, BiShareAlt, BiCopy } from 'react-icons/bi';
import { FaFacebookF, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { apiService } from '../services/api';
import { toast } from 'sonner';

export function EntrevistaDetailPage() {
  const { slug } = useParams();
  const [entrevista, setEntrevista] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [relatedEntrevistas, setRelatedEntrevistas] = useState([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Memoize filtered related interviews
  const filteredRelatedEntrevistas = useMemo(() => {
    return relatedEntrevistas.filter(item => item.slug !== slug);
  }, [relatedEntrevistas, slug]);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4; // Show 4 items per page
  const totalPages = Math.ceil(filteredRelatedEntrevistas.length / itemsPerPage);

  useEffect(() => {
    // Scroll to top when component mounts or slug changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const loadEntrevista = async () => {
      if (!slug) {
        setError('URL no válida');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const data = await apiService.getEntrevistaBySlug(slug);
        
        if (!data) {
          throw new Error('Entrevista no encontrada');
        }

        setEntrevista(data);

        // Load related interviews
        const relatedData = await apiService.getEntrevistas();
        setRelatedEntrevistas(relatedData);
      } catch (err) {
        console.error('Error cargando entrevista:', err);
        setError(err.message || 'Error al cargar la entrevista');
      } finally {
        setIsLoading(false);
      }
    };

    loadEntrevista();
  }, [slug]);

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = entrevista?.title;

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

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-black via-black/95 to-black/90">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-8 animate-pulse">
              <div className="w-10 h-10 bg-white/10 rounded-full" />
              <div className="h-4 bg-white/10 rounded w-32" />
            </div>
            <div className="space-y-8">
              <div className="h-12 bg-white/10 rounded-lg w-3/4" />
              <div className="aspect-video bg-white/10 rounded-2xl shadow-2xl" />
              <div className="space-y-4 max-w-2xl">
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-5/6" />
                <div className="h-4 bg-white/10 rounded w-4/5" />
              </div>
            </div>
          </motion.div>
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
              <Link
                to="/entrevistas"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mt-4"
              >
                <BiArrowBack className="w-5 h-5" />
                Volver a entrevistas
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link
              to="/entrevistas"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-all transform hover:-translate-x-2"
            >
              <BiArrowBack className="w-5 h-5" />
              <span>Volver a entrevistas</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Compartir entrevista"
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

          {entrevista && (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <header className="text-center mb-12">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent mb-6"
                >
                  {entrevista.title}
                </motion.h1>
                {entrevista.date && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400"
                  >
                    {new Date(entrevista.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </motion.p>
                )}
              </header>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl mb-12 group"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${entrevista.youtubeId}`}
                  title={entrevista.title}
                  className="w-full h-full"
                  allowFullScreen
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isVideoPlaying ? 'opacity-0' : 'opacity-100'}`} />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-16"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg">
                  <div className="max-w-3xl mx-auto">
                    <div className="space-y-4">
                      {entrevista.description.split('\n\n').map((paragraph, idx) => (
                        <p 
                          key={idx}
                          className="text-gray-300 leading-relaxed text-lg"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {entrevista.tags && entrevista.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-6">
                        {entrevista.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {relatedEntrevistas.length > 0 && (
                <section className="mt-16">
                  <h2 className="text-2xl font-bold text-white mb-8">Entrevistas relacionadas</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {filteredRelatedEntrevistas
                      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                      .map((item, index) => (
                        <motion.div
                          key={item.slug}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            to={`/entrevistas/${item.slug}`}
                            className="block group"
                          >
                            <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden mb-4 relative">
                              <div className="w-full h-full">
                                <img
                                  src={item.portada?.url || '/placeholder-cover.jpg'}
                                  alt={item.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-90 transition-opacity" />
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                                  <h3 className="text-white font-medium line-clamp-2 group-hover:text-primary transition-colors text-sm md:text-base">
                                    {item.title}
                                  </h3>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className={`px-4 py-2 rounded-lg transition-colors ${currentPage === 0 ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        Anterior
                      </button>
                      <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(index)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${currentPage === index ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage === totalPages - 1}
                        className={`px-4 py-2 rounded-lg transition-colors ${currentPage === totalPages - 1 ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </section>
              )}
            </motion.article>
          )}
        </div>
      </div>
    </div>
  );
}