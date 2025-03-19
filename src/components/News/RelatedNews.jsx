import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const RelatedNews = ({ news }) => {
  if (!news || news.length === 0) return null;

  const getFullUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? `https://api.voltajedigital.com${url}` : url;
  };

  return (
    <div className="mt-16 border-t border-gray-800 pt-8">
      <h2 className="text-2xl font-bold text-white mb-8">Noticias Relacionadas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <Link
            key={item.id}
            to={`/noticias/${item.slug}`}
            className="group block bg-[#1C1C1C] rounded-lg overflow-hidden hover:bg-[#2C2C2C] transition-all duration-300 transform hover:-translate-y-1"
          >
            {item.featured_image?.url && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getFullUrl(item.featured_image.url)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {item.categoria && (
                  <span className="absolute top-3 left-3 bg-primary px-3 py-1 rounded-full text-xs font-medium">
                    {item.categoria.name}
                  </span>
                )}
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {item.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{format(new Date(item.published), 'd MMM yyyy', { locale: es })}</span>
                <span className="text-primary group-hover:translate-x-1 transition-transform duration-200">
                  Leer más →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
