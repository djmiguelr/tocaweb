import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BASE_URL } from '../services/api';
import { BiArrowBack } from 'react-icons/bi';

export function NewsDetailPage() {
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slug } = useParams();

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `${BASE_URL}/api/noticias?filters[slug][$eq]=${slug}&populate=*`
        );

        if (!response.ok) {
          throw new Error('Error al cargar la noticia');
        }

        const { data } = await response.json();
        if (!data || data.length === 0) {
          throw new Error('Noticia no encontrada');
        }

        setNews(data[0]);
      } catch (error) {
        console.error('Error fetching news detail:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchNewsDetail();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-800 rounded w-3/4"></div>
            <div className="h-96 bg-gray-800 rounded"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-800 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!news) return null;

  return (
    <div className="container mx-auto px-4 pt-24 md:pt-28 pb-32">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/noticias"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mb-8 transition-colors"
        >
          <BiArrowBack className="w-5 h-5" />
          Volver a noticias
        </Link>

        <article className="space-y-8">
          <header className="space-y-4">
            <div className="inline-flex px-3 py-1 rounded-full bg-primary text-white text-sm">
              {news.attributes.categoria}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {news.attributes.title}
            </h1>
            
            <time 
              className="text-gray-400"
              dateTime={news.attributes.Fechapublicacion}
            >
              {new Date(news.attributes.Fechapublicacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </header>

          <div className="aspect-video rounded-xl overflow-hidden bg-gray-800">
            <img
              src={news.attributes.Imagendestacada?.url}
              alt={news.attributes.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div 
            className="prose prose-lg prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: news.attributes.contenido.replace(/\n/g, '<br>') }}
          />
        </article>
      </div>
    </div>
  );
}