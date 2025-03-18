import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getFullImageUrl, getSiteUrl } from '../utils/urlUtils';
import PropTypes from 'prop-types';

export const SEO = ({ 
  title,
  description,
  type = 'website',
  image,
  url,
  publishedTime,
  modifiedTime,
  author = 'Toca Stereo',
  section,
  category,
  tags = [],
  duration,
  contentType = 'default',
  contentData = {},
  canonicalUrl,
  locale = 'es_CO',
  alternateLocales = []
}) => {
  const location = useLocation();
  const siteUrl = getSiteUrl();
  const pageUrl = url || `${siteUrl}${location.pathname}`;
  const defaultDescription = 'Toca Stereo - La mejor música y contenido. Escucha las mejores mezclas y mantente al día con las últimas noticias musicales.';
  const defaultImage = `${siteUrl}/og-image.jpg`;
  const fullImage = image ? getFullImageUrl(image) : defaultImage;
  const siteName = 'Toca Stereo';

  // Organización base para JSON-LD
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl}/logo.png`,
      "width": "512",
      "height": "512"
    },
    "sameAs": [
      "https://www.facebook.com/tocastereo",
      "https://twitter.com/tocastereo",
      "https://www.instagram.com/tocastereo"
    ]
  };

  // Sitio web para JSON-LD
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const generateStructuredData = () => {
    let structuredData = [organizationData, websiteData];

    switch (contentType) {
      case 'article':
        structuredData.push({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageUrl
          },
          "headline": title,
          "description": description || defaultDescription,
          "image": {
            "@type": "ImageObject",
            "url": fullImage,
            "width": "1200",
            "height": "630"
          },
          "author": {
            "@type": "Person",
            "name": author
          },
          "publisher": organizationData,
          "datePublished": publishedTime,
          "dateModified": modifiedTime || publishedTime,
          "articleSection": section || category,
          "keywords": tags.join(', '),
          "url": pageUrl,
          "inLanguage": locale
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
          "url": pageUrl,
          "inLanguage": locale
        });
        break;

      case 'radio':
        structuredData.push({
          "@context": "https://schema.org",
          "@type": "RadioStation",
          "name": contentData.stationName || siteName,
          "url": pageUrl,
          "broadcastDisplayName": contentData.displayName,
          "broadcastTimezone": "America/Bogota",
          "broadcastFrequency": contentData.frequency,
          "genre": contentData.genre || "Music",
          "image": fullImage,
          "inLanguage": locale
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
          "inAlbum": contentData.album,
          "genre": contentData.genre,
          "url": pageUrl,
          "inLanguage": locale
        });
        break;
    }

    return structuredData;
  };

  useEffect(() => {
    // Actualizar título de la página
    document.title = `${title} | ${siteName}`;

    // Función auxiliar para actualizar meta tags
    const updateMetaTag = (name, content) => {
      if (!content) return;

      // Eliminar meta tags existentes
      document.querySelector(`meta[name="${name}"]`)?.remove();
      document.querySelector(`meta[property="${name}"]`)?.remove();

      const meta = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('article:')) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    };

    // Meta tags básicos
    updateMetaTag('description', description || defaultDescription);
    updateMetaTag('robots', 'index, follow, max-image-preview:large');

    // Open Graph básico
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description || defaultDescription);
    updateMetaTag('og:image', fullImage);
    updateMetaTag('og:url', pageUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', siteName);
    updateMetaTag('og:locale', locale);

    // Twitter Cards
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@tocastereo');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description || defaultDescription);
    updateMetaTag('twitter:image', fullImage);

    // Meta tags específicos para artículos
    if (contentType === 'article') {
      updateMetaTag('article:published_time', publishedTime);
      updateMetaTag('article:modified_time', modifiedTime || publishedTime);
      updateMetaTag('article:author', author);
      updateMetaTag('article:section', section || category);
      tags.forEach((tag, index) => {
        updateMetaTag(`article:tag:${index}`, tag);
      });
    }

    // URL Canónica
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl || pageUrl);

    // Alternate Languages
    alternateLocales.forEach(alt => {
      let altLink = document.querySelector(`link[hreflang="${alt.lang}"]`);
      if (!altLink) {
        altLink = document.createElement('link');
        altLink.setAttribute('rel', 'alternate');
        altLink.setAttribute('hreflang', alt.lang);
        document.head.appendChild(altLink);
      }
      altLink.setAttribute('href', alt.url);
    });

    // JSON-LD
    let scriptTag = document.querySelector('#structured-data');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'structured-data';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(generateStructuredData());

  }, [
    title,
    description,
    image,
    type,
    pageUrl,
    publishedTime,
    modifiedTime,
    author,
    section,
    category,
    tags,
    contentType,
    contentData,
    canonicalUrl,
    locale,
    alternateLocales
  ]);

  return null;
};

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  type: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  publishedTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  author: PropTypes.string,
  section: PropTypes.string,
  category: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  duration: PropTypes.string,
  contentType: PropTypes.oneOf(['default', 'article', 'podcast', 'radio', 'music']),
  contentData: PropTypes.object,
  canonicalUrl: PropTypes.string,
  locale: PropTypes.string,
  alternateLocales: PropTypes.arrayOf(
    PropTypes.shape({
      lang: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired
    })
  )
};
