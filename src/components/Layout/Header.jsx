import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCity } from '../../context/CityContext';
import { BASE_URL } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BiMenu, BiX, BiSearch } from 'react-icons/bi';
import { BsWhatsapp } from 'react-icons/bs';

export function Header() {
  const { selectedCity } = useCity();
  const [headerData, setHeaderData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/header?populate=*`);
        const data = await response.json();
        setHeaderData(data.data);
      } catch (error) {
        console.error('Error fetching header data:', error);
      }
    };

    fetchHeaderData();
  }, []);

  const renderLogo = () => {
    if (selectedCity?.logo?.url) {
      return (
        <img 
          src={`${BASE_URL}${selectedCity.logo.url}`} 
          alt={selectedCity.name}
          className="h-10 md:h-12 w-auto"
        />
      );
    }

    if (headerData?.logoprincipal?.url) {
      return (
        <img 
          src={`${BASE_URL}${headerData.logoprincipal.url}`}
          alt={headerData.Titulo || 'TocaStereo'}
          className="h-10 md:h-12 w-auto"
        />
      );
    }

    return (
      <img 
        src="/logo.svg" 
        alt="TocaStereo" 
        className="h-10 md:h-12"
      />
    );
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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
            <NavLink to="/">Inicio</NavLink>
            <NavLink to="/secciones">Noticias</NavLink>
            <NavLink to="/toca-exitos">TocaExitos</NavLink>
            <NavLink to="/podcasts">Locutores</NavLink>
            <NavLink to="/locutores">TocaEntrevistas</NavLink>
            <NavLink to="/contacto">Contacto</NavLink>
          </nav>
          
          {/* Acciones */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {selectedCity?.Redes?.map((red) => {
              if (red.plataforma === 'Whatsapp') {
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
              className="p-2 md:hidden hover:bg-white/5 rounded-full transition-colors text-white"
            >
              <BiMenu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-0 bg-[#1C1C1C] z-50"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4">
                {renderLogo()}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-white"
                >
                  <BiX className="w-6 h-6" />
                </motion.button>
              </div>

              <nav className="flex-1 overflow-y-auto py-8">
                <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>Inicio</MobileNavLink>
                <MobileNavLink to="/secciones" onClick={() => setIsMenuOpen(false)}>Noticias</MobileNavLink>
                <MobileNavLink to="/toca-exitos" onClick={() => setIsMenuOpen(false)}>TocaExitos</MobileNavLink>
                <MobileNavLink to="/podcasts" onClick={() => setIsMenuOpen(false)}>Locutores</MobileNavLink>
                <MobileNavLink to="/locutores" onClick={() => setIsMenuOpen(false)}>TocaEntrevistas</MobileNavLink>
                <MobileNavLink to="/contacto" onClick={() => setIsMenuOpen(false)}>Contacto</MobileNavLink>
              </nav>
            </div>
          </motion.div>
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
      className="block px-6 py-4 text-lg font-medium text-white hover:text-primary transition-colors border-b border-white/10"
    >
      {children}
    </Link>
  );
}