import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getFullImageUrl, getSiteUrl } from '../utils/urlUtils';

export const SEO = ({ 
  title,
  description,
  type = 'website',
  image,
  publishedTime,
  modifiedTime,
  author = 'Toca Stereo',
  category,
  tags = [],
  duration,
  contentType = 'default', // 'article' | 'podcast' | 'radio' | 'music' | 'default'
  contentData = {} // Datos específicos según el tipo de contenido
}) => {
  const location = useLocation();
  const fullUrl = getSiteUrl(location.pathname);
  const defaultDescription = 'Toca Stereo - La mejor música y contenido. Escucha las mejores mezclas y mantente al día con las últimas noticias musicales.';
  const defaultImage = getSiteUrl('/og-image.jpg');
  const fullImage = getFullImageUrl(image) || defaultImage;
  
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Toca Stereo",
    "url": getSiteUrl(),
    "logo": getSiteUrl('/logo.png'),
    "sameAs": [
      "https://www.facebook.com/tocastereo",
      "https://twitter.com/tocastereo",
      "https://www.instagram.com/tocastereo"
    ]
  };

  const generateStructuredData = () => {
    let structuredData = [organizationData];

    switch (contentType) {
      case 'article':
        structuredData.push({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": title,
          "description": description || defaultDescription,
          "image": fullImage,
          "author": {
            "@type": "Person",
            "name": author
          },
          "publisher": organizationData,
          "datePublished": publishedTime,
          "dateModified": modifiedTime || publishedTime,
          "articleSection": category,
          "keywords": tags.join(', '),
          "url": fullUrl
        });
        break;

      case 'podcast':
        structuredData.push({
          "@context": "https://schema.org",
          "@type": "PodcastEpisode",
          "name": title,
          "description": description || defaultDescription,
          "thumbnailUrl": fullImage,
          "uploadDate": publishedTime,
          "duration": duration,
          "author": {
            "@type": "Person",
            "name": author
          },
          "publisher": organizationData,
          "url": fullUrl
        });
        break;

      case 'radio':
        structuredData.push({
          "@context": "https://schema.org",
          "@type": "RadioStation",
          "name": contentData.stationName || "Toca Stereo",
          "url": fullUrl,
          "broadcastDisplayName": contentData.displayName,
          "broadcastTimezone": "America/Bogota",
          "broadcastFrequency": contentData.frequency,
          "genre": contentData.genre || "Music",
          "image": fullImage
        });
        break;

      case 'music':
        structuredData.push({
          "@context": "https://schema.org",
          "@type": "MusicRecording",
          "name": title,
          "byArtist": {
            "@type": "MusicGroup",
            "name": contentData.artist
          },
          "duration": duration,
          "inAlbum": contentData.album ? {
            "@type": "MusicAlbum",
            "name": contentData.album
          } : undefined,
          "genre": contentData.genre,
          "url": fullUrl,
          "image": fullImage
        });
        break;

      default:
        structuredData.push({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": title,
          "description": description || defaultDescription,
          "url": fullUrl,
          "image": fullImage,
          "publisher": organizationData
        });
    }

    return structuredData;
  };

  useEffect(() => {
    // Actualizar título y meta tags
    document.title = `${title} | Toca Stereo`;
    
    // Actualizar meta tags básicos
    updateMetaTag('description', description || defaultDescription);
    updateMetaTag('author', author);
    updateMetaTag('keywords', tags.join(', '));

    // Open Graph
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description || defaultDescription);
    updateMetaTag('og:url', fullUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:image', fullImage);
    if (publishedTime) {
      updateMetaTag('og:published_time', publishedTime);
      updateMetaTag('article:published_time', publishedTime);
    }
    if (modifiedTime) {
      updateMetaTag('og:modified_time', modifiedTime);
      updateMetaTag('article:modified_time', modifiedTime);
    }
    if (category) {
      updateMetaTag('article:section', category);
    }
    tags.forEach((tag) => {
      updateMetaTag('article:tag', tag);
    });

    // Twitter Cards
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@tocastereo');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description || defaultDescription);
    updateMetaTag('twitter:image', fullImage);

    // Datos estructurados JSON-LD
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    const structuredData = generateStructuredData();
    structuredData.forEach(data => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
    });

    // Google Analytics page view
    if (window.gtag) {
      window.gtag('config', 'G-DWF14H7B3R', {
        page_path: location.pathname,
        page_title: title,
        content_type: contentType
      });
    }
  }, [title, description, type, image, location, publishedTime, modifiedTime, author, category, tags, contentType, contentData]);

  return null;
};

function updateMetaTag(name, content) {
  if (!content) return;
  
  let meta = document.querySelector(`meta[${name.includes(':') ? 'property' : 'name'}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(name.includes(':') ? 'property' : 'name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}
