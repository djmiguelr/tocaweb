import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

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

export function NewsPage() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { category } = useParams();

  const categories = ['Todos', 'Entretenimiento', 'Nacional', 'Deportes', 'Mundo'];

  useEffect(() => {
    if (category) {
      setSelectedCategory(category.toLowerCase());
    }
  }, [category]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getNews();
        const sortedNews = data
          .filter(item => item?.attributes?.Fechapublicacion)
          .sort((a, b) => 
            new Date(b.attributes.Fechapublicacion) - new Date(a.attributes.Fechapublicacion)
          );

        setNews(sortedNews);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Error al cargar las noticias');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter(item => 
        item.attributes.categoría.toLowerCase() === selectedCategory
      );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-32">
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
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-32">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 md:pt-28 pb-32">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-8">Noticias</h1>
        
        <div className="flex flex-wrap gap-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category.toLowerCase())}
              className={`px-6 py-2 rounded-full transition-all ${selectedCategory === category.toLowerCase()
                ? 'bg-primary text-white'
                : 'bg-[#1C1C1C] text-gray-400 hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredNews.map(news => (
          <Link key={news.id} to={`/noticias/${news.attributes.slug}`}>
            <NewsCard news={news} />
          </Link>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No hay noticias disponibles en esta categoría.
          </p>
        </div>
      )}
    </div>
  );
}