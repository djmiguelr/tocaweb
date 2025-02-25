import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

function NewsCard({ news }) {
  return (
    <div className="bg-[#1C1C1C] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={news.attributes.Imagendestacada?.url}
          alt={news.attributes.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full">
          <span className="text-sm text-white font-medium">
            {news.attributes.categoría}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl text-white font-bold mt-2 line-clamp-2 group-hover:text-primary transition-colors">
          {news.attributes.title}
        </h3>
        <p className="text-sm text-gray-400 mt-2">
          {new Date(news.attributes.Fechapublicacion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}

export function NewsSection() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const categories = ['Entretenimiento', 'Nacional', 'Deportes', 'Mundo'];

  useEffect(() => {
    const loadNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getNews();
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }
        const validNews = data.filter(item => {
          const hasValidImage = item?.attributes?.Imagendestacada?.data?.attributes?.url;
          return (
            item?.attributes?.Fechapublicacion &&
            item?.attributes?.title &&
            item?.attributes?.categoría &&
            item?.attributes?.slug &&
            hasValidImage
          );
        });
        const sortedNews = validNews
          .sort((a, b) => new Date(b.attributes.Fechapublicacion) - new Date(a.attributes.Fechapublicacion));
        setNews(sortedNews);
        setLatestNews(sortedNews.slice(0, 6));
      } catch (error) {
        console.error('Error loading news:', error);
        setError('Error al cargar las noticias. Por favor, intente más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, []);

  const getNewsByCategory = (category) => {
    return news
      .filter(item => item.attributes.categoría === category)
      .slice(0, 3);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No hay noticias disponibles en este momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Últimas Noticias */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Últimas Noticias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestNews.map(news => (
            <Link key={news.id} to={`/noticias/${news.attributes.slug}`}>
              <NewsCard news={news} />
            </Link>
          ))}
        </div>
      </section>

      {/* Secciones por Categoría */}
      {categories.map(category => (
        <section key={category} className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">{category}</h2>
            <Link
              to={`/noticias/categoria/${category.toLowerCase()}`}
              className="text-primary hover:text-primary-dark font-medium"
            >
              Ver más
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getNewsByCategory(category).map(news => (
              <Link key={news.id} to={`/noticias/${news.attributes.slug}`}>
                <NewsCard news={news} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}