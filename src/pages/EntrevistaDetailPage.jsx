import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BiArrowBack } from 'react-icons/bi';
import { apiService } from '../services/api';

export function EntrevistaDetailPage() {
  const { slug } = useParams();
  const [entrevista, setEntrevista] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        console.log('Cargando entrevista con slug:', slug);
        const data = await apiService.getEntrevistaBySlug(slug);
        
        if (!data) {
          throw new Error('Entrevista no encontrada');
        }

        setEntrevista(data);
      } catch (err) {
        console.error('Error cargando entrevista:', err);
        setError(err.message || 'Error al cargar la entrevista');
      } finally {
        setIsLoading(false);
      }
    };

    loadEntrevista();
  }, [slug]);

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
        <Link
          to="/entrevistas"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mb-8 transition-all transform hover:-translate-x-2"
        >
          <BiArrowBack className="w-5 h-5" />
          <span>Volver a entrevistas</span>
        </Link>

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

            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed">
                {entrevista.description}
              </p>
            </div>
          </motion.article>
        )}
      </div>
    </div>
  );
} 