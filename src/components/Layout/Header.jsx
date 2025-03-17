import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCity } from '../../context/CityContext';
import { constants } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BiMenu, BiX, BiSearch } from 'react-icons/bi';
import { BsWhatsapp } from 'react-icons/bs';
import apiService from '../../services/api';
import { useHeader } from '../../context/HeaderContext';
import { usePlayer } from '../../context/PlayerContext';
import { searchNews } from '../../services/newsApi';
import { FiMenu } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';

const navigation = [
  { label: 'Inicio', path: '/' },
  { label: 'Noticias', path: '/noticias' },
  { label: 'TocaExitos', path: '/toca-exitos' },
  { label: 'TocaEntrevistas', path: '/entrevistas' },
  { label: 'Programacion', path: '/programacion' },
];

export function Header() {
  const { selectedCity } = useCity();
  const { headerInfo } = useHeader();
  const { isPlaying, playLiveStream, togglePlay } = usePlayer();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderLogo = () => {
    if (selectedCity?.logo?.url) {
      return (
        <img 
          src={selectedCity.logo.url} 
          alt={selectedCity.name}
          className="h-14 md:h-20 w-auto"
        />
      );
    }

    if (headerInfo?.logo?.url) {
      return (
        <img
          src={headerInfo.logo.url}
          alt={headerInfo.title}
          className="h-12 md:h-16 w-auto"
        />
      );
    }

    return (
      <span className="text-2xl md:text-3xl font-bold">{headerInfo?.title || 'Toca Stereo'}</span>
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      const results = await searchNews(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching news:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (slug) => {
    // navigate(`/noticias/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-300 ${
      isScrolled ? 'bg-[#1C1C1C]/95 backdrop-blur-lg shadow-lg' : 'bg-[#1C1C1C]'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            {renderLogo()}
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`text-base font-medium transition-colors ${
                  location.pathname === item.path ? 'text-primary' : 'text-white hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Acciones */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {selectedCity?.Redes?.map((red) => {
              if (red?.plataforma === 'Whatsapp' && red?.URL) {
                const whatsappUrl = red.URL.startsWith('+') 
                  ? `https://wa.me/${red.URL.replace('+', '')}`
                  : red.URL;
                
                return (
                  <motion.a
                    key={red.id}
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full transition-colors"
                  >
                    <BsWhatsapp className="w-5 h-5" />
                    <span className="text-sm font-medium">Escríbenos</span>
                  </motion.a>
                );
              }
              return null;
            })}
            
            <div className="flex md:hidden items-center gap-4">
              {/* Botón de búsqueda móvil */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <BiSearch className="w-5 h-5" />
              </button>

              {/* Botón menú móvil */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white"
              >
                <FiMenu className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {/* Botón de búsqueda */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-full transition-all ${
                  isScrolled ? 'hover:bg-white/20 bg-white/10' : 'hover:bg-white/5'
                } text-white`}
              >
                <BiSearch className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Panel */}
      <div
        className={`absolute left-0 right-0 top-full bg-[#1A1A1A] border-t border-gray-800 transition-all duration-300 ${
          isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <IoClose className="w-6 h-6" />
            </button>
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                id="searchInput"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar noticias..."
                className="w-full bg-[#242424] text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <BiSearch className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>

          {/* Search Results */}
          <div className="relative">
            {searchResults.length > 0 && (
              <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      to={`/noticias/${result.slug}`}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="bg-[#242424] p-4 rounded-lg hover:bg-[#2A2A2A] transition-all text-left group"
                    >
                      {result.featured_image?.url && (
                        <div className="aspect-video rounded-lg overflow-hidden mb-3">
                          <img
                            src={result.featured_image.url.startsWith('/') ? `https://api.voltajedigital.com${result.featured_image.url}` : result.featured_image.url}
                            alt={result.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h3 className="text-white font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {result.title}
                      </h3>
                      {result.excerpt && (
                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                          {result.excerpt}
                        </p>
                      )}
                      {result.author && (
                        <div className="flex items-center text-sm text-gray-500">
                          {result.author.avatar?.url && (
                            <img
                              src={result.author.avatar.url.startsWith('/') ? `https://api.voltajedigital.com${result.author.avatar.url}` : result.author.avatar.url}
                              alt={result.author.name}
                              className="w-6 h-6 rounded-full mr-2 object-cover"
                            />
                          )}
                          <span>{result.author.name}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="mt-4 text-center text-gray-400 py-8">
                <p className="text-lg mb-2">No se encontraron resultados para "{searchQuery}"</p>
                <p className="text-sm">Intenta con otros términos de búsqueda</p>
              </div>
            )}

            {isSearching && (
              <div className="mt-4 text-center text-gray-400 py-8">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p>Buscando...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portal para el menú móvil */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[9999] md:hidden">
            {/* Overlay de fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Panel del menú */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-[100dvh] w-[90vw] sm:w-[400px] bg-[#1C1C1C] shadow-2xl flex flex-col"
            >
              {/* Header del menú */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <div className="flex-shrink-0">
                  <Link to="/" onClick={() => setIsMenuOpen(false)}>
                    {renderLogo()}
                  </Link>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 -mr-2 text-white hover:text-primary transition-colors"
                >
                  <BiX className="w-8 h-8" />
                </motion.button>
              </div>

              {/* Navegación */}
              <div className="flex-1 overflow-y-auto">
                <nav className="py-6">
                  {navigation.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 text-lg font-medium transition-colors ${
                        location.pathname === item.path ? 'text-primary' : 'text-white hover:text-primary'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Footer del menú */}
              <div className="p-6 border-t border-white/10">
                {selectedCity?.Redes?.map((red) => {
                  if (red?.plataforma === 'Whatsapp' && red?.URL) {
                    const whatsappUrl = red.URL.startsWith('+') 
                      ? `https://wa.me/${red.URL.replace('+', '')}`
                      : red.URL;
                    
                    return (
                      <motion.a
                        key={red.id}
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full transition-colors"
                      >
                        <BsWhatsapp className="w-5 h-5" />
                        <span className="text-sm font-medium">Escríbenos</span>
                      </motion.a>
                    );
                  }
                  return null;
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}