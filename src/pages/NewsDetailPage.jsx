import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getNewsBySlug } from '../services/newsApi';
import { SEO } from '../components/SEO';
import { SocialEmbed } from '../components/Social/SocialEmbed';
import { ShareButtons } from '../components/Social/ShareButtons';
import { RelatedNews } from '../components/News/RelatedNews';

export const NewsDetailPage = () => {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const newsData = await getNewsBySlug(slug);
        
        if (!newsData) {
          throw new Error('Noticia no encontrada');
        }

        setNews(newsData);

        // Fetch related news based on category
        if (newsData.categoria?.id) {
          const relatedNewsData = await fetch(
            `https://api.voltajedigital.com/api/noticias?filters[categoria][id]=${newsData.categoria.id}&filters[id][$ne]=${newsData.id}&sort[0]=published:desc&pagination[limit]=3`
          ).then(res => res.json());
          
          setRelatedNews(relatedNewsData.data || []);
        }
      } catch (error) {
        console.error('Error al cargar la noticia:', error);
        setError('No se pudo cargar la noticia');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-4xl mx-auto">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="h-12 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-700 rounded-lg mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8 max-w-4xl mx-auto">
          <Link
            to="/noticias"
            className="inline-flex items-center text-primary hover:text-primary-hover transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a noticias
          </Link>
        </nav>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Noticia no encontrada'}</p>
        </div>
      </div>
    );
  }

  const {
    documentId,
    title,
    content,
    excerpt,
    image_source,
    published,
    featured_image,
    author,
    categoria,
    tags,
    updated_at,
    slug: newsSlug,
  } = news;

  const imageUrl = featured_image?.url;
  const authorName = author?.name;
  const authorSlug = author?.slug;
  const authorAvatar = author?.avatar?.url;
  const authorBio = author?.bio;
  const currentUrl = `https://tocastereo.co/noticias/${newsSlug}`;
  const formattedKeywords = tags?.map(tag => tag.Nombre).join(', ');

  const renderContent = () => {
    if (!Array.isArray(content)) {
      return <p className="text-white">No hay contenido disponible</p>;
    }

    return content.map((block, index) => {
      switch (block.type) {
        case 'paragraph':
          return (
            <p key={index} className="mb-6 text-white text-lg leading-relaxed">
              {block.children?.map((child, childIndex) => (
                <React.Fragment key={childIndex}>
                  {child.text}
                </React.Fragment>
              ))}
            </p>
          );

        case 'code':
          const codeContent = block.children?.map(child => child.text).join('') || '';
          return (
            <SocialEmbed
              key={index}
              content={codeContent}
            />
          );

        case 'image':
          if (!block.image) return null;
          const imgUrl = block.image.url;
          return (
            <figure key={index} className="my-12">
              <img
                src={imgUrl.startsWith('/') ? `https://api.voltajedigital.com${imgUrl}` : imgUrl}
                alt={block.image.alternativeText || ''}
                className="w-full h-auto rounded-lg shadow-lg"
              />
              {block.image.caption && (
                <figcaption className="mt-3 text-sm text-gray-400 text-center italic">
                  {block.image.caption}
                </figcaption>
              )}
            </figure>
          );

        default:
          return null;
      }
    });
  };

  return (
    <>
      <SEO
        title={title}
        description={excerpt}
        image={imageUrl}
        url={`/noticias/${newsSlug}`}
        type="article"
        publishedTime={published}
        modifiedTime={updated_at}
        author={authorName}
        section={categoria?.name}
        tags={tags?.map(tag => tag.Nombre)}
        canonicalUrl={currentUrl}
        newsKeywords={formattedKeywords}
        siteName="Toca Stereo"
        twitterCard="summary_large_image"
        category={categoria?.name}
      />
      
      <div className="min-h-screen bg-[#121212]">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-8 max-w-4xl mx-auto">
            <Link
              to="/noticias"
              className="inline-flex items-center text-primary hover:text-primary-hover transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a noticias
            </Link>
          </nav>

          <article className="max-w-4xl mx-auto">
            <header className="mb-12">
              {/* Categoría */}
              {categoria && (
                <Link
                  to={`/categoria/${categoria.slug}`}
                  className="inline-block bg-primary/20 text-primary px-4 py-1 rounded-full text-sm font-medium mb-6 hover:bg-primary/30 transition-colors duration-200"
                >
                  {categoria.name}
                </Link>
              )}

              {/* Título */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {title}
              </h1>

              {/* Meta información */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                {/* Fecha */}
                <time dateTime={published}>
                  {format(new Date(published), "d 'de' MMMM, yyyy", { locale: es })}
                </time>

                {/* Autor */}
                {authorName && (
                  <div className="flex items-center">
                    <span className="mx-2">•</span>
                    <div className="flex items-center gap-2">
                      {authorAvatar && (
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>{authorName}</span>
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* Imagen destacada */}
            {imageUrl && (
              <figure className="mb-12">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                {image_source && (
                  <figcaption className="mt-3 text-sm text-gray-400 text-center italic">
                    Fuente: {image_source}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Botones de compartir */}
            <div className="mb-12">
              <ShareButtons
                url={currentUrl}
                title={title}
                description={excerpt}
                image={imageUrl}
              />
            </div>

            {/* Contenido */}
            <div className="prose prose-invert max-w-none">
              {renderContent()}
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <h2 className="text-white font-medium mb-4">Temas relacionados:</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Link
                      key={index}
                      to={`/tag/${tag.slug}`}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm rounded-full transition-colors duration-200"
                    >
                      {tag.Nombre}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Autor bio */}
            {authorName && authorBio && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex items-start gap-4">
                  {authorAvatar && (
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h2 className="text-white font-medium mb-2">{authorName}</h2>
                    <p className="text-white/60">{authorBio}</p>
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Noticias relacionadas */}
          {relatedNews.length > 0 && (
            <div className="mt-16">
              <RelatedNews news={relatedNews} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
