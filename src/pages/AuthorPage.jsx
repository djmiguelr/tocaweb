import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAuthorBySlug, getAllAuthors } from '../services/newsApi';
import { SEO } from '../components/SEO';
import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const AuthorPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableAuthors, setAvailableAuthors] = useState([]);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener la lista de autores disponibles
        const authors = await getAllAuthors();
        setAvailableAuthors(authors);

        // Verificar si el slug existe
        const authorExists = authors.some(author => author.slug === slug);
        if (!authorExists) {
          throw new Error(`No se encontró el autor "${slug}"`);
        }

        const authorData = await getAuthorBySlug(slug);
        if (!authorData) {
          throw new Error('No se pudo obtener la información del autor');
        }
        setAuthor(authorData);
      } catch (error) {
        console.error('Error al cargar los datos del autor:', error);
        setError(error.message || 'No se pudo encontrar el autor');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchAuthorData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug]);

  const handleAuthorClick = (authorSlug) => {
    navigate(`/autor/${authorSlug}`, { replace: true });
  };

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate('/noticias', { replace: true });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse max-w-7xl mx-auto">
            <nav className="mb-8">
              <div className="h-4 bg-gray-700 rounded w-32"></div>
            </nav>
            <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
              <div className="h-48 w-48 bg-gray-700 rounded-full shrink-0"></div>
              <div className="flex-1">
                <div className="h-10 bg-gray-700 rounded w-64 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-full max-w-2xl"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6 max-w-2xl"></div>
                  <div className="h-4 bg-gray-700 rounded w-4/6 max-w-2xl"></div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8">
              <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-[#1A1A1A] rounded-xl overflow-hidden"
                  >
                    <div className="aspect-video bg-gray-700"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="container mx-auto px-4 py-12">
          <nav className="mb-8">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center text-primary hover:text-primary-hover transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a noticias
            </button>
          </nav>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">¡Ups! Algo salió mal</h2>
            <p className="text-red-500 mb-8 text-lg">{error}</p>
            {availableAuthors.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl text-white mb-6">Autores disponibles:</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {availableAuthors.map((author) => (
                    <button
                      key={author.slug}
                      onClick={() => handleAuthorClick(author.slug)}
                      className="inline-flex items-center bg-[#1A1A1A] hover:bg-[#242424] text-primary hover:text-primary-hover px-4 py-2 rounded-full transition-all duration-200"
                    >
                      {author.avatar?.url && (
                        <img
                          src={author.avatar.url.startsWith('/') ? `https://api.voltajedigital.com${author.avatar.url}` : author.avatar.url}
                          alt={author.name}
                          className="w-6 h-6 rounded-full mr-2 object-cover"
                        />
                      )}
                      {author.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { name, bio, avatar, news } = author;
  const avatarUrl = avatar?.url;

  return (
    <>
      <SEO
        title={`${author.name} - Autor`}
        description={author.bio || `Lee las últimas noticias escritas por ${author.name} en Toca Stereo`}
        image={author.avatar?.url}
        url={`/autor/${author.slug}`}
        type="profile"
        canonicalUrl={`https://tocastereo.co/autor/${author.slug}`}
      />
      
      <div className="min-h-screen bg-[#121212]">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/20 to-[#121212] pt-24 pb-16">
          <div className="container mx-auto px-4">
            <nav className="mb-12">
              <button
                onClick={handleBackClick}
                className="inline-flex items-center text-primary hover:text-primary-hover transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a noticias
              </button>
            </nav>

            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              {avatarUrl && (
                <div className="relative mb-8">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 ring-4 ring-offset-8 ring-primary/30 ring-offset-[#121212] shadow-2xl">
                    <img
                      src={avatarUrl.startsWith('/') ? `https://api.voltajedigital.com${avatarUrl}` : avatarUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <svg 
                        className="w-4 h-4 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-5xl font-bold text-white mb-6 leading-tight">{name}</h1>
                {bio && (
                  <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                    {bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Noticias del autor */}
        {news && news.length > 0 && (
          <div className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-white mb-12">
              Últimas noticias de {name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {news.map((article) => (
                <button
                  key={article.id}
                  onClick={() => navigate(`/noticias/${article.slug}`, { replace: true })}
                  className="bg-[#1A1A1A] rounded-xl overflow-hidden hover:bg-[#242424] transition-colors duration-200 text-left"
                >
                  {article.featured_image?.url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.featured_image.url.startsWith('/') ? `https://api.voltajedigital.com${article.featured_image.url}` : article.featured_image.url}
                        alt={article.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <time className="text-sm text-gray-500">
                      {formatDate(article.published)}
                    </time>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
