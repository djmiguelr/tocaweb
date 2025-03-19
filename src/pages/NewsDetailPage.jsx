import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getNewsBySlug } from '../services/newsApi';
import { SEO } from '../components/SEO';
import { SocialEmbed } from '../components/Social/SocialEmbed';
import { ShareButtons } from '../components/Social/ShareButtons';
import { RelatedNews } from '../components/News/RelatedNews';
import { HeaderAd, InArticleAd, SidebarAd } from '../components/Ads/AdLayouts';

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
        <nav aria-label="Breadcrumb" className="mb-8 max-w-4xl mx-auto">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                to="/"
                className="text-gray-600 hover:text-primary transition-colors duration-200"
              >
                Inicio
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                to="/noticias"
                className="text-gray-600 hover:text-primary transition-colors duration-200"
              >
                Noticias
              </Link>
            </li>
          </ol>
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

  const getFullUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? `https://api.voltajedigital.com${url}` : url;
  };

  const imageUrl = getFullUrl(featured_image?.url);
  const authorName = author?.name;
  const authorSlug = author?.slug;
  const authorAvatar = getFullUrl(author?.avatar?.url);
  const authorBio = author?.bio;
  const currentUrl = `https://tocastereo.co/noticias/${newsSlug}`;
  const formattedKeywords = tags?.map(tag => tag.Nombre).join(', ');

  const renderContent = () => {
    if (!Array.isArray(content)) {
      return <p className="text-white">No hay contenido disponible</p>;
    }

    return content.map((block, index) => {
      switch (block.type) {
        case 'heading':
          const HeadingTag = `h${block.level}`;
          const headingClasses = {
            1: 'text-4xl font-bold text-white mb-6 mt-8 leading-tight',
            2: 'text-3xl font-bold text-white mb-5 mt-7 leading-tight',
            3: 'text-2xl font-bold text-white mb-4 mt-6 leading-tight',
            4: 'text-xl font-semibold text-white mb-4 mt-5 leading-tight',
            5: 'text-lg font-semibold text-white mb-3 mt-4 leading-tight',
            6: 'text-base font-semibold text-white mb-3 mt-4 leading-tight'
          };
          return (
            <HeadingTag key={index} className={headingClasses[block.level]}>
              {block.children?.map((child, childIndex) => (
                <React.Fragment key={childIndex}>
                  {child.text}
                </React.Fragment>
              ))}
            </HeadingTag>
          );

        case 'paragraph':
          return (
            <p key={index} className="text-white text-lg leading-relaxed mb-6">
              {block.children?.map((child, childIndex) => (
                <React.Fragment key={childIndex}>
                  {child.text}
                </React.Fragment>
              ))}
            </p>
          );

        case 'list':
          const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
          const listStyle = block.format === 'ordered' ? 'list-decimal' : 'list-disc';
          return (
            <ListTag key={index} className={`${listStyle} list-inside mb-6 text-white space-y-3 pl-4`}>
              {block.children?.map((item, itemIndex) => (
                <li key={itemIndex} className="text-lg leading-relaxed">
                  {item.children?.map((child, childIndex) => (
                    <React.Fragment key={childIndex}>
                      {child.text}
                    </React.Fragment>
                  ))}
                </li>
              ))}
            </ListTag>
          );

        case 'image':
          if (!block.image?.url) return null;
          
          const fullImageUrl = getFullUrl(block.image.url);
          
          return (
            <figure key={index} className="my-6">
              <img
                src={fullImageUrl}
                alt={block.image.alternativeText || ''}
                className="w-full h-auto rounded-lg"
                width={block.image.width}
                height={block.image.height}
                loading="lazy"
              />
              {block.image.caption && (
                <figcaption className="mt-2 text-sm text-gray-400 text-center">
                  {block.image.caption}
                </figcaption>
              )}
            </figure>
          );

        case 'quote':
          return (
            <blockquote key={index} className="border-l-4 border-primary pl-4 my-6">
              <p className="text-xl text-gray-300 italic">
                {block.children?.map((child, childIndex) => (
                  <React.Fragment key={childIndex}>
                    {child.text}
                  </React.Fragment>
                ))}
              </p>
            </blockquote>
          );

        case 'code':
          const codeContent = block.children?.map(child => child.text).join('') || '';
          return (
            <SocialEmbed
              key={index}
              content={codeContent}
            />
          );

        default:
          console.warn('Tipo de bloque no manejado:', block.type);
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
          {/* Header Ad */}
          <div className="w-full max-w-7xl mx-auto mb-8">
            <HeaderAd />
          </div>

          {/* Breadcrumb - Centered */}
          <div className="w-full max-w-7xl mx-auto flex justify-center mb-8">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-primary transition-colors duration-200"
                  >
                    Inicio
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link
                    to="/noticias"
                    className="text-gray-600 hover:text-primary transition-colors duration-200"
                  >
                    Noticias
                  </Link>
                </li>
              </ol>
            </nav>
          </div>

          <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Contenido Principal */}
              <article className="flex-grow lg:max-w-[calc(100%-320px)]">
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
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    {title}
                  </h2>

                  {/* Excerpt */}
                  {excerpt && (
                    <p className="text-xl text-gray-400 mb-6">
                      {excerpt}
                    </p>
                  )}

                  {/* Metadatos */}
                  <div className="flex items-center justify-between text-gray-400 text-sm">
                    <div className="flex items-center">
                      {authorAvatar && (
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                      )}
                      <div>
                        {authorName && authorSlug ? (
                          <Link
                            to={`/autor/${authorSlug}`}
                            className="font-medium hover:text-primary"
                          >
                            {authorName}
                          </Link>
                        ) : (
                          authorName && <span className="font-medium">{authorName}</span>
                        )}
                        {published && (
                          <div className="text-gray-500">
                            {format(new Date(published), "d 'de' MMMM, yyyy", { locale: es })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <ShareButtons
                      url={currentUrl}
                      title={title}
                      description={excerpt}
                      image={imageUrl}
                    />
                  </div>

                  {/* Imagen destacada */}
                  {imageUrl && (
                    <div className="mt-8 -mx-4 sm:mx-0">
                      <figure className="relative aspect-video rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {image_source && (
                          <figcaption className="absolute bottom-0 right-0 bg-black/70 text-xs text-gray-300 px-3 py-1">
                            {image_source}
                          </figcaption>
                        )}
                      </figure>
                    </div>
                  )}
                </header>

                {/* Content */}
                <div className="prose prose-invert prose-lg max-w-none mb-12">
                  {renderContent().map((block, index) => {
                    // Insertar anuncio cada 3 bloques de contenido
                    if (index > 0 && index % 3 === 0) {
                      return (
                        <React.Fragment key={`ad-${index}`}>
                          {block}
                          <InArticleAd />
                        </React.Fragment>
                      );
                    }
                    return block;
                  })}
                </div>

                {/* Temas Relacionados */}
                {tags && tags.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-xl font-bold text-white mb-4">Temas Relacionados</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Link
                          key={tag.id}
                          to={`/tags/${tag.slug}`}
                          className="text-sm text-gray-400 hover:text-primary bg-[#1A1A1A] px-3 py-1.5 rounded-full transition-colors duration-200"
                        >
                          #{tag.Nombre}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related News */}
                <RelatedNews news={relatedNews} />
              </article>

              {/* Sidebar */}
              <aside className="w-full lg:w-80 lg:sticky lg:top-8 lg:h-fit">
                <div className="sticky top-8">
                  <SidebarAd />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
