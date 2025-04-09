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

  // Función para generar el JSON-LD según el tipo de contenido
  const generateStructuredData = () => {
    switch (contentType) {
      case 'article':
        const articleData = {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": title,
          "name": title,
          "description": description || defaultDescription,
          "articleBody": contentData.articleBody,
          "wordCount": contentData.wordCount,
          "image": [
            {
              "@type": "ImageObject",
              "url": fullImage,
              "width": contentData.imageWidth || 1200,
              "height": contentData.imageHeight || 630
            }
          ],
          "datePublished": publishedTime,
          "dateModified": modifiedTime || publishedTime,
          "author": {
            "@type": "Person",
            "name": author,
            "url": contentData.authorUrl ? `${siteUrl}${contentData.authorUrl}` : undefined
          },
          "publisher": {
            "@type": "Organization",
            "name": siteName,
            "url": siteUrl,
            "logo": {
              "@type": "ImageObject",
              "url": `${siteUrl}/logo.png`,
              "width": "512",
              "height": "512"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageUrl
          },
          "articleSection": section || category || contentData.articleSection,
          "keywords": contentData.keywords || tags.join(", "),
          "inLanguage": "es",
          "copyrightYear": new Date(publishedTime).getFullYear(),
          "copyrightHolder": {
            "@type": "Organization",
            "name": siteName
          }
        };

        // Agregar URL canónica si existe
        if (canonicalUrl) {
          articleData.url = canonicalUrl;
        }

        // Agregar thumbnailUrl si existe
        if (contentData.thumbnailUrl) {
          articleData.thumbnailUrl = contentData.thumbnailUrl;
        }

        return articleData;
      case 'audio':
        return {
          "@context": "https://schema.org",
          "@type": "AudioObject",
          "name": title,
          "description": description || defaultDescription,
          "duration": duration,
          "contentUrl": contentData.audioUrl,
          "encodingFormat": "audio/mpeg"
        };
      default:
        return organizationData;
    }
  };

  useEffect(() => {
    // Actualizar el título del documento
    document.title = `${title} | ${siteName}`;

    // Función para crear o actualizar una meta tag
    const updateMetaTag = (name, content) => {
      if (!content) return;
      
      let meta = document.querySelector(`meta[${name.startsWith('og:') ? 'property' : 'name'}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Función para crear o actualizar una link tag
    const updateLinkTag = (rel, href, hreflang) => {
      if (!href) return;
      
      let link = document.querySelector(`link[rel="${rel}"]${hreflang ? `[hreflang="${hreflang}"]` : ''}`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        if (hreflang) link.setAttribute('hreflang', hreflang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Actualizar meta tags básicos
    updateMetaTag('description', description || defaultDescription);
    updateMetaTag('author', author);
    updateMetaTag('robots', 'index, follow');

    // Actualizar Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description || defaultDescription);
    updateMetaTag('og:type', type);
    updateMetaTag('og:url', pageUrl);
    updateMetaTag('og:image', fullImage);
    updateMetaTag('og:site_name', siteName);
    updateMetaTag('og:locale', locale);

    // Actualizar Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description || defaultDescription);
    updateMetaTag('twitter:image', fullImage);
    updateMetaTag('twitter:site', '@tocastereo');

    // Actualizar article tags si es necesario
    if (type === 'article') {
      updateMetaTag('article:published_time', publishedTime);
      updateMetaTag('article:modified_time', modifiedTime || publishedTime);
      updateMetaTag('article:author', author);
      updateMetaTag('article:section', section);
      tags.forEach((tag, index) => {
        updateMetaTag(`article:tag`, tag);
      });
    }

    // Actualizar canonical y alternate URLs
    updateLinkTag('canonical', canonicalUrl || pageUrl);
    alternateLocales.forEach(alt => {
      updateLinkTag('alternate', alt.url, alt.locale);
    });

    // Actualizar JSON-LD
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(generateStructuredData());

    // Cleanup function
    return () => {
      // Limpiar JSON-LD
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [
    title,
    description,
    type,
    image,
    pageUrl,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    canonicalUrl,
    locale,
    alternateLocales,
    contentType,
    contentData,
    duration
  ]);

  // Renderizar las meta tags iniciales para SSR
  const initialMetaTags = `
    <title>${title} | ${siteName}</title>
    <meta name="description" content="${description || defaultDescription}" />
    <meta name="author" content="${author}" />
    <meta name="robots" content="index, follow" />
    
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description || defaultDescription}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:image" content="${fullImage}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:locale" content="${locale}" />
    
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description || defaultDescription}" />
    <meta name="twitter:image" content="${fullImage}" />
    <meta name="twitter:site" content="@tocastereo" />
    
    ${type === 'article' ? `
      <meta property="article:published_time" content="${publishedTime}" />
      <meta property="article:modified_time" content="${modifiedTime || publishedTime}" />
      <meta property="article:author" content="${author}" />
      <meta property="article:section" content="${section}" />
      ${tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join('\n')}
    ` : ''}
    
    <link rel="canonical" href="${canonicalUrl || pageUrl}" />
    ${alternateLocales.map(alt => `<link rel="alternate" href="${alt.url}" hreflang="${alt.locale}" />`).join('\n')}
    
    <script type="application/ld+json">
      ${JSON.stringify(generateStructuredData())}
    </script>
  `;

  // Insertar las meta tags en el documento durante el SSR
  if (typeof document === 'undefined') {
    return initialMetaTags;
  }

  // En el cliente, no renderizar nada visible
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
  contentType: PropTypes.oneOf(['default', 'article', 'audio']),
  contentData: PropTypes.object,
  canonicalUrl: PropTypes.string,
  locale: PropTypes.string,
  alternateLocales: PropTypes.arrayOf(
    PropTypes.shape({
      locale: PropTypes.string,
      url: PropTypes.string
    })
  )
};
