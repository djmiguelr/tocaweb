import React, { useEffect, useState } from 'react';
import { getLatestNews } from '../../services/newsApi';
import { NewsCard } from './NewsCard';

export const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsData = await getLatestNews();
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('No se pudieron cargar las noticias');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-[#1A1A1A] rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-gray-800"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                  <div className="h-3 bg-gray-800 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="text-center py-8 bg-[#1A1A1A] rounded-xl">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center py-8 bg-[#1A1A1A] rounded-xl">
          <p className="text-gray-400">No hay noticias disponibles</p>
        </div>
      </div>
    );
  }

  // Tomar las primeras 4 noticias
  const latestNews = news.slice(0, 4);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {latestNews.map((newsItem) => (
          <NewsCard key={newsItem.id} news={newsItem} />
        ))}
      </div>
    </div>
  );
};
