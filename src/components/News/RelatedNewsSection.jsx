import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function RelatedNewsSection({ relatedNews }) {
  if (!relatedNews || relatedNews.length === 0) return null;

  return (
    <section className="mt-16 container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-8">Noticias relacionadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedNews.map((item, index) => (
            <motion.article
              key={item.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors"
            >
              <Link to={`/noticias/${item.slug}`} className="block">
                <div className="relative h-48 overflow-hidden">
                  {item.imagen?.url && (
                    <img
                      src={item.imagen.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                      {item.categoria}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <time className="text-gray-400 text-sm mb-3 block">
                    {new Date(item.fechaPublicacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}