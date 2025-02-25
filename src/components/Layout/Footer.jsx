import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BASE_URL } from '../../services/api';
import { useCity } from '../../context/CityContext';
import { 
  FaHeart,
  FaAppStore,
  FaGooglePlay,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaTiktok
} from 'react-icons/fa6';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [headerData, setHeaderData] = useState(null);
  const { selectedCity } = useCity();

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

  const appLinks = selectedCity?.apps?.[0] || {
    android: "https://play.google.com/store/apps/details?id=com.tocastereo.radio",
    ios: "https://apps.apple.com/us/app/toca-stereo/id1134895093"
  };

  return (
    <footer className="bg-gradient-to-b from-[#1C1C1C] to-[#2C2C2C] text-white pb-28 md:pb-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12 border-b border-white/10">
          {/* Logo */}
          <div className="space-y-6">
            {headerData?.logoprincipal?.url ? (
              <img 
                src={`${BASE_URL}${headerData.logoprincipal.url}`}
                alt={headerData.Titulo || 'TocaStereo'}
                className="h-20 w-auto"
              />
            ) : (
              <img src="/logo.svg" alt="TocaStereo" className="h-20" />
            )}
            {selectedCity?.Redes && selectedCity.Redes.length > 0 && (
              <div className="flex gap-3">
                {selectedCity.Redes.map((red) => (
                  <SocialLink
                    key={red.id}
                    href={red.url}
                    icon={FaHeart}
                    label={red.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Enlaces Rápidos - Solo visible en desktop */}
          <div className="hidden md:block">
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <nav className="grid gap-2">
              <NavLink to="/">Inicio</NavLink>
              <NavLink to="/secciones">Noticias</NavLink>
              <NavLink to="/toca-exitos">TocaExitos</NavLink>
              <NavLink to="/locutores">Locutores</NavLink>
              <NavLink to="/contacto">Contacto</NavLink>
            </nav>
          </div>

          {/* Descargar Apps */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6">Descarga nuestra app</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.a
                href={appLinks.ios}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
              >
                <FaAppStore className="w-8 h-8 text-white/60 group-hover:text-white transition-colors" />
                <div>
                  <div className="text-xs text-white/60">Descargar en</div>
                  <div className="text-sm font-medium">App Store</div>
                </div>
              </motion.a>

              <motion.a
                href={appLinks.android}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
              >
                <FaGooglePlay className="w-8 h-8 text-white/60 group-hover:text-white transition-colors" />
                <div>
                  <div className="text-xs text-white/60">Descargar en</div>
                  <div className="text-sm font-medium">Google Play</div>
                </div>
              </motion.a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-center text-sm text-white/60">
            <p>© {currentYear} TocaStereo. Todos los derechos reservados.</p>
            <p className="mt-2 flex items-center justify-center gap-1">
              Hecho con <FaHeart className="text-red-500" /> en Colombia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function NavLink({ to, children }) {
  return (
    <Link 
      to={to}
      className="text-gray-400 hover:text-white transition-colors inline-block"
    >
      <motion.span
        whileHover={{ x: 6 }}
        className="flex items-center gap-2"
      >
        <span className="text-primary">›</span>
        {children}
      </motion.span>
    </Link>
  );
}

function SocialLink({ href, label, ...props }) {
  const getIconByLabel = (label) => {
    switch(label?.toLowerCase()) {
      case 'facebook':
        return FaFacebook;
      case 'twitter':
        return FaTwitter;
      case 'instagram':
        return FaInstagram;
      case 'youtube':
        return FaYoutube;
      case 'tiktok':
        return FaTiktok;
      default:
        return FaHeart;
    }
  };

  const Icon = getIconByLabel(label);

  return (
    <motion.a
      href={href}
      aria-label={label}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
      {...props}
    >
      <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
    </motion.a>
  );
}