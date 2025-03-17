import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  siteName = 'Toca Stereo',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  alternateUrls = [],
  newsKeywords,
  audioUrl,
  duration,
  category,
  rating,
  readTime,
}) => {
  const siteUrl = 'https://tocastereo.co';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const imageUrl = image?.startsWith('http') ? image : image ? `${siteUrl}${image}` : `${siteUrl}/og-image.jpg`;
  const formattedTitle = title ? `${title} | Toca Stereo` : 'Toca Stereo - Tu Radio Online';
  const defaultKeywords = 'radio online, música, noticias musicales, entretenimiento, cultura, colombia, emisora digital';
  const formattedKeywords = newsKeywords ? `${defaultKeywords}, ${newsKeywords}` : defaultKeywords;

  return (
    <Helmet>
      {/* Metadatos Básicos */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={formattedKeywords} />
      <link rel="canonical" href={canonicalUrl || fullUrl} />
      <meta name="author" content={author || 'Toca Stereo'} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} Toca Stereo`} />
      <meta name="generator" content="Toca Stereo" />

      {/* Metadatos de Tiempo de Lectura y Categorización */}
      {readTime && <meta name="reading-time" content={`${readTime} minutes`} />}
      {category && <meta name="category" content={category} />}
      {rating && <meta name="rating" content={rating} />}

      {/* Idioma y región */}
      <meta property="og:locale" content="es_CO" />
      <meta httpEquiv="content-language" content="es-CO" />
      <link rel="alternate" href={fullUrl} hrefLang="es-co" />
      <link rel="alternate" href={fullUrl} hrefLang="es" />
      <link rel="alternate" href={fullUrl} hrefLang="x-default" />
      <meta name="language" content="Spanish" />
      <meta name="geo.country" content="CO" />

      {/* Alternate URLs para otros idiomas */}
      {alternateUrls.map(({ lang, url }) => (
        <link key={lang} rel="alternate" href={url} hrefLang={lang} />
      ))}

      {/* Open Graph Mejorado */}
      <meta property="og:site_name" content="Toca Stereo" />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="es_CO" />
      <meta property="og:locale:alternate" content="es" />
      {audioUrl && (
        <>
          <meta property="og:audio" content={audioUrl} />
          <meta property="og:audio:type" content="audio/mpeg" />
        </>
      )}
      {duration && <meta property="og:duration" content={duration} />}
      
      {/* Article específico */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <>
              <meta property="article:published_time" content={publishedTime} />
              <meta name="publish_date" content={publishedTime} />
            </>
          )}
          {modifiedTime && (
            <>
              <meta property="article:modified_time" content={modifiedTime} />
              <meta name="last-modified" content={modifiedTime} />
            </>
          )}
          {section && (
            <>
              <meta property="article:section" content={section} />
              <meta name="news_keywords" content={`${section}, ${tags?.join(', ')}`} />
            </>
          )}
          {author && (
            <>
              <meta property="article:author" content={author} />
              <meta property="article:publisher" content="https://tocastereo.co" />
              <meta name="author" content={author} />
            </>
          )}
          {tags && tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
          
          {/* Google News y otros agregadores */}
          <meta name="news_keywords" content={tags?.join(', ')} />
          <meta name="googlebot-news" content="index, follow" />
          <meta name="original-source" content={canonicalUrl || fullUrl} />
          <meta name="standout" content={canonicalUrl || fullUrl} />
        </>
      )}

      {/* Twitter Cards Mejoradas */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@tocastereo" />
      <meta name="twitter:creator" content="@tocastereo" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={formattedTitle} />
      <meta name="twitter:domain" content="tocastereo.co" />
      {audioUrl && <meta name="twitter:player" content={audioUrl} />}

      {/* Robots y Control de Indexación */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="coverage" content="Worldwide" />
      <meta name="target" content="all" />
      <meta name="rating" content="general" />

      {/* Ubicación y Geolocalización */}
      <meta name="geo.region" content="CO" />
      <meta name="geo.placename" content="Colombia" />
      <meta name="geo.position" content="4.570868;-74.297333" />
      <meta name="ICBM" content="4.570868, -74.297333" />
      <meta name="geo.country" content="CO" />
      <meta name="DC.coverage" content="Colombia" />

      {/* PWA y Móvil */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="Toca Stereo" />
      <meta name="theme-color" content="#121212" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="Toca Stereo" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="msapplication-TileColor" content="#121212" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Dublin Core */}
      <meta name="DC.title" content={formattedTitle} />
      <meta name="DC.description" content={description} />
      <meta name="DC.publisher" content="Toca Stereo" />
      <meta name="DC.language" content="es-CO" />
      <meta name="DC.rights" content={`© ${new Date().getFullYear()} Toca Stereo`} />
      {author && <meta name="DC.creator" content={author} />}
      {publishedTime && <meta name="DC.date" content={publishedTime} />}
      {type === 'article' && <meta name="DC.type" content="article" />}

      {/* Schema.org - WebSite */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Toca Stereo',
          url: siteUrl,
          description: 'Tu Radio Online - Noticias de música, entretenimiento y cultura',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/buscar?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          },
          inLanguage: 'es-CO',
          copyrightYear: new Date().getFullYear(),
          isAccessibleForFree: true,
          isFamilyFriendly: true
        })}
      </script>

      {/* Schema.org - Artículo o Página */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'NewsArticle' : 'WebPage',
          headline: title,
          description: description,
          image: imageUrl,
          url: fullUrl,
          inLanguage: 'es-CO',
          ...(type === 'article' && {
            datePublished: publishedTime,
            dateModified: modifiedTime || publishedTime,
            author: {
              '@type': 'Person',
              name: author,
              url: `${siteUrl}/autor/${author?.toLowerCase().replace(/\s+/g, '-')}`
            },
            publisher: {
              '@type': 'Organization',
              name: 'Toca Stereo',
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/logo.png`
              }
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': fullUrl
            },
            articleSection: section,
            keywords: tags?.join(', '),
            wordCount: description?.split(' ').length,
            ...(readTime && { timeRequired: `PT${readTime}M` })
          })
        })}
      </script>

      {/* Schema.org - Organización */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Toca Stereo',
          alternateName: 'Toca Stereo Radio Online',
          url: siteUrl,
          logo: `${siteUrl}/logo.png`,
          description: 'Tu Radio Online - Noticias de música, entretenimiento y cultura',
          sameAs: [
            'https://facebook.com/tocastereo',
            'https://twitter.com/tocastereo',
            'https://instagram.com/tocastereo'
          ],
          contactPoint: [{
            '@type': 'ContactPoint',
            telephone: '+57-XXX-XXXXXXX',
            contactType: 'customer service',
            areaServed: 'CO',
            availableLanguage: ['Spanish']
          }],
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'CO',
            addressRegion: 'Bogotá'
          },
          foundingDate: '2024',
          founders: [{
            '@type': 'Person',
            name: 'Toca Stereo Team'
          }],
          knowsLanguage: ['es-CO', 'es'],
          areaServed: {
            '@type': 'Country',
            name: 'Colombia'
          }
        })}
      </script>

      {/* Schema.org - BreadcrumbList */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              item: {
                '@id': siteUrl,
                name: 'Inicio'
              }
            },
            ...(url ? [{
              '@type': 'ListItem',
              position: 2,
              item: {
                '@id': fullUrl,
                name: title
              }
            }] : [])
          ]
        })}
      </script>

      {/* Schema.org - AudioObject (para contenido de radio) */}
      {audioUrl && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AudioObject',
            name: formattedTitle,
            description: description,
            contentUrl: audioUrl,
            encodingFormat: 'audio/mpeg',
            duration: duration,
            uploadDate: publishedTime,
            copyrightHolder: {
              '@type': 'Organization',
              name: 'Toca Stereo'
            }
          })}
        </script>
      )}
    </Helmet>
  );
};
