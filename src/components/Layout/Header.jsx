import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCity } from '../../context/CityContext';
import { constants } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BiMenu, BiX, BiSearch } from 'react-icons/bi';
import { BsWhatsapp } from 'react-icons/bs';
import apiService from '../../services/api';
import { useHeader } from '../../context/HeaderContext';

const navigation = [
  { label: 'Inicio', path: '/' },
  { label: 'TocaExitos', path: '/toca-exitos' },
  { label: 'TocaEntrevistas', path: '/entrevistas' },
  { label: 'Programacion', path: '/programacion' },
  { label: 'Live', path: '/live' }
];

export function Header() {
  const { selectedCity } = useCity();
  const { headerInfo } = useHeader();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navigation.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path}
              >
                {item.label}
              </NavLink>
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
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white"
            >
              <BiSearch className="w-5 h-5" />
            </motion.button>

            {/* Botón menú móvil */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(true)}
              className={`p-2 md:hidden rounded-full transition-all ${isScrolled ? 'hover:bg-white/20 bg-white/10' : 'hover:bg-white/5'} text-white`}
            >
              <BiMenu className="w-6 h-6" />
            </motion.button>
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
                    <MobileNavLink 
                      key={item.path} 
                      to={item.path} 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </MobileNavLink>
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors"
                      >
                        <BsWhatsapp className="w-6 h-6" />
                        <span className="text-lg font-medium">Escríbenos por WhatsApp</span>
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

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 text-sm font-medium text-white hover:text-primary transition-colors rounded-lg hover:bg-white/5"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-6 py-4 text-lg font-medium text-white hover:text-primary hover:bg-white/5 transition-colors"
    >
      {children}
    </Link>
  );
}