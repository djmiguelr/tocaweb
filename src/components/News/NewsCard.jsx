import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/dateUtils';
import { getImageUrl } from '../../utils/imageUtils';

export const NewsCard = ({ news }) => {
  if (!news) {
    console.warn('NewsCard: No se proporcionó la noticia');
    return null;
  }

  const {
    title,
    slug,
    image_source,
    published,
    featured_image,
    author,
    categoria
  } = news;

  if (!title || !slug) {
    console.warn('NewsCard: Faltan campos requeridos (title o slug)', { title, slug });
    return null;
  }

  const imageUrl = featured_image?.url || image_source;
  const authorName = author?.name || 'Anónimo';
  const authorSlug = author?.slug;
  const categoryName = categoria?.name;
  const categorySlug = categoria?.slug;

  return (
    <article className="bg-[#2C2C2C] rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
      <Link to={`/noticias/${slug}`} className="block">
        <div className="h-48 relative overflow-hidden">
          {imageUrl && (
            <img
              src={getImageUrl(imageUrl)}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                console.error('Error loading image:', imageUrl);
                e.target.src = '/placeholder.jpg';
              }}
            />
          )}
        </div>

        <div className="p-4">
          {/* Categoría y Fecha */}
          <div className="flex items-center justify-between mb-2">
            {categoryName && categorySlug && (
              <span
                className="inline-block bg-primary text-white text-xs font-semibold px-2 py-1 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/categoria/${categorySlug}`;
                }}
              >
                {categoryName}
              </span>
            )}
            {published && (
              <time dateTime={published} className="text-sm text-gray-500">
                {formatDate(published)}
              </time>
            )}
          </div>

          {/* Titular */}
          <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary">
            {title}
          </h2>

          {/* Autor */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              {authorName && authorSlug ? (
                <span
                  className="hover:text-primary cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/autor/${authorSlug}`;
                  }}
                >
                  {authorName}
                </span>
              ) : (
                <span>{authorName}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

NewsCard.propTypes = {
  news: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    slug: PropTypes.string,
    image_source: PropTypes.string,
    published: PropTypes.string,
    featured_image: PropTypes.shape({
      url: PropTypes.string
    }),
    author: PropTypes.shape({
      name: PropTypes.string,
      slug: PropTypes.string
    }),
    categoria: PropTypes.shape({
      name: PropTypes.string,
      slug: PropTypes.string
    })
  })
};
