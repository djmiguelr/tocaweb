import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
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
        const filtered = relatedData.filter(item => item.slug !== slug).slice(0, 4);
        setRelatedEntrevistas(filtered);
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
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4 w-1/3" />
            <div className="aspect-video bg-white/10 rounded mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-full" />
            </div>
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
              <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {entrevista.title}
                </h1>
              </header>

              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl mb-8">
                <iframe
                  src={`https://www.youtube.com/embed/${entrevista.youtubeId}`}
                  title={entrevista.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>

              <div className="prose prose-lg prose-invert max-w-none mb-16">
                <p className="text-gray-300 leading-relaxed">
                  {entrevista.description}
                </p>
              </div>

              {relatedEntrevistas.length > 0 && (
                <section className="mt-16">
                  <h2 className="text-2xl font-bold text-white mb-8">Entrevistas relacionadas</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {relatedEntrevistas.map((item, index) => (
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
                          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                            <div className="w-full h-full relative">
                              <img
                                src={item.thumbnail || `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <h3 className="text-white font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </motion.article>
          )}
        </div>
      </div>
    </div>
  );
}