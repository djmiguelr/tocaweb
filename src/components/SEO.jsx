import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SEO = ({ title, description, type = 'website', image }) => {
  const location = useLocation();
  const baseUrl = 'https://tocastero.com';
  const fullUrl = `${baseUrl}${location.pathname}`;
  const defaultDescription = 'Toca Stereo - La mejor música y contenido. Escucha las mejores mezclas y mantente al día con las últimas noticias musicales.';
  const defaultImage = `${baseUrl}/og-image.jpg`;

  useEffect(() => {
    // Actualizar título y meta tags
    document.title = `${title} | Toca Stereo`;
    
    // Actualizar meta tags
    updateMetaTag('description', description || defaultDescription);
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description || defaultDescription);
    updateMetaTag('og:url', fullUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:image', image || defaultImage);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description || defaultDescription);
    updateMetaTag('twitter:image', image || defaultImage);

    // Google Analytics page view
    if (window.gtag) {
      window.gtag('config', 'G-DWF14H7B3R', {
        page_path: location.pathname,
        page_title: title
      });
    }
  }, [title, description, type, image, location]);

  return null;
};

function updateMetaTag(name, content) {
  let meta = document.querySelector(`meta[${name.includes('og:') ? 'property' : 'name'}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(name.includes('og:') ? 'property' : 'name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}
