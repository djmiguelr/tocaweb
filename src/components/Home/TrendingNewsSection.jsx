import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

export function TrendingNewsSection() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const params = new URLSearchParams({
          'filters[categoria][slug][$eq]': 'tendencias',
          'sort[0]': 'published:desc',
          'pagination[limit]': '4',
          'populate[featured_image][fields][0]': 'url',
          'populate[featured_image][fields][1]': 'formats',
          'populate[categoria][fields][0]': 'name',
          'populate[categoria][fields][1]': 'slug',
        });

        const response = await fetch(`https://api.voltajedigital.com/api/noticias?${params}`);
        if (!response.ok) throw new Error('Error al cargar las noticias');
        
        const data = await response.json();
        if (!data?.data || !Array.isArray(data.data)) {
          console.error('Unexpected API response:', data);
          setError('Formato de respuesta inválido');
          return;
        }
        setNews(data.data);
      } catch (err) {
        console.error('Error fetching trending news:', err);
        setError('Error al cargar las noticias');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-[#2A2A2A] rounded-xl p-4 group">
            <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gray-800"></div>
            <div className="space-y-3">
              <div className="h-5 bg-gray-800 rounded-full w-24"></div>
              <div className="h-6 bg-gray-800 rounded-lg w-full"></div>
              <div className="h-4 bg-gray-800 rounded-lg w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {news.map((article) => {
        const imageUrl = article.featured_image?.formats?.medium?.url || 
                        article.featured_image?.formats?.small?.url ||
                        article.featured_image?.url ||
                        '/placeholder-news.jpg';
        
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `https://api.voltajedigital.com${imageUrl}`;

        return (
          <Link 
            key={article.id}
            to={`/noticias/${article.slug}`}
            className="group bg-[#2A2A2A] rounded-xl p-4 hover:bg-[#333333] transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
              <img
                src={fullImageUrl}
                alt={article.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute bottom-3 left-3 right-3 z-20">
                <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-medium rounded-full transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                  {article.categoria?.name || 'Tendencias'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors duration-300 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                {DOMPurify.sanitize(article.excerpt || '', { ALLOWED_TAGS: [] })}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
