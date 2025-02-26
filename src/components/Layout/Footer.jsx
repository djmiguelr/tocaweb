import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCity } from '../../context/CityContext';
import { useHeader } from '../../context/HeaderContext';
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaGooglePlay,
  FaAppStore,
  FaTwitter,
  FaLinkedinIn,
  FaPinterestP,
  FaSpotify,
  FaSoundcloud,
  FaDiscord,
  FaTelegram,
  FaVk,
  FaRedditAlien,
  FaTwitch,
  FaSnapchatGhost,
  FaSkype,
  FaViber
} from 'react-icons/fa';
import {
  BsInstagram,
  BsFacebook,
  BsYoutube,
  BsTiktok,
  BsWhatsapp,
  BsTwitter,
  BsLinkedin,
  BsPinterest,
  BsSpotify,
  BsDiscord,
  BsTelegram,
  BsReddit,
  BsTwitch,
  BsSnapchat
} from 'react-icons/bs';

export function Footer() {
  const { selectedCity } = useCity();
  const { headerInfo } = useHeader();
  const currentYear = new Date().getFullYear();

  // Mapa de iconos con alternativas
  const socialIcons = {
    'Facebook': [FaFacebookF, BsFacebook],
    'facebook': [FaFacebookF, BsFacebook],
    'Instagram': [FaInstagram, BsInstagram],
    'instagram': [FaInstagram, BsInstagram],
    'Youtube': [FaYoutube, BsYoutube],
    'youtube': [FaYoutube, BsYoutube],
    'Tiktok': [FaTiktok, BsTiktok],
    'tiktok': [FaTiktok, BsTiktok],
    'TikTok': [FaTiktok, BsTiktok],
    'Whatsapp': [FaWhatsapp, BsWhatsapp],
    'whatsapp': [FaWhatsapp, BsWhatsapp],
    'WhatsApp': [FaWhatsapp, BsWhatsapp],
    'Twitter': [FaTwitter, BsTwitter],
    'twitter': [FaTwitter, BsTwitter],
    'LinkedIn': [FaLinkedinIn, BsLinkedin],
    'linkedin': [FaLinkedinIn, BsLinkedin],
    'Pinterest': [FaPinterestP, BsPinterest],
    'pinterest': [FaPinterestP, BsPinterest],
    'Spotify': [FaSpotify, BsSpotify],
    'spotify': [FaSpotify, BsSpotify],
    'Soundcloud': [FaSoundcloud],
    'soundcloud': [FaSoundcloud],
    'Discord': [FaDiscord, BsDiscord],
    'discord': [FaDiscord, BsDiscord],
    'Telegram': [FaTelegram, BsTelegram],
    'telegram': [FaTelegram, BsTelegram],
    'VK': [FaVk],
    'vk': [FaVk],
    'Reddit': [FaRedditAlien, BsReddit],
    'reddit': [FaRedditAlien, BsReddit],
    'Twitch': [FaTwitch, BsTwitch],
    'twitch': [FaTwitch, BsTwitch],
    'Snapchat': [FaSnapchatGhost, BsSnapchat],
    'snapchat': [FaSnapchatGhost, BsSnapchat],
    'Skype': [FaSkype],
    'skype': [FaSkype],
    'Viber': [FaViber],
    'viber': [FaViber]
  };

  useEffect(() => {
    console.log('Selected city in Footer:', selectedCity);
    if (selectedCity?.Redes) {
      console.log('Social networks:', selectedCity.Redes);
    }
    if (selectedCity?.Redes?.length > 0) {
      console.log('Redes sociales encontradas:', selectedCity.Redes.map(red => ({
        plataforma: red.plataforma,
        url: red.URL
      })));
    }
  }, [selectedCity]);

  const renderAppLinks = () => {
    if (!selectedCity?.apps) return null;

    return (
      <div className="flex flex-row gap-4 justify-center lg:justify-start">
        {selectedCity.apps.android && (
          <motion.a
            href={selectedCity.apps.android}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl hover:bg-primary transition-all duration-300"
          >
            <FaGooglePlay className="w-6 h-6" />
            <div className="flex flex-col">
              <span className="text-xs text-white/60">Descarga en</span>
              <span className="text-sm font-medium">Google Play</span>
            </div>
          </motion.a>
        )}
        {selectedCity.apps.ios && (
          <motion.a
            href={selectedCity.apps.ios}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl hover:bg-primary transition-all duration-300"
          >
            <FaAppStore className="w-6 h-6" />
            <div className="flex flex-col">
              <span className="text-xs text-white/60">Descarga en</span>
              <span className="text-sm font-medium">App Store</span>
            </div>
          </motion.a>
        )}
      </div>
    );
  };

  const renderSocialLinks = () => {
    if (!selectedCity?.Redes?.length) return null;

    return selectedCity.Redes.map((red) => {
      if (!red?.plataforma || !red?.URL) return null;

      const IconSet = socialIcons[red.plataforma] || 
                     socialIcons[red.plataforma.toLowerCase()];

      if (!IconSet) return null;

      const Icon = IconSet[0];
      let url = red.URL;
      
      if (red.plataforma.toLowerCase() === 'whatsapp') {
        const cleanNumber = url.replace(/\D/g, '');
        url = `https://wa.me/${cleanNumber}`;
      } else if (!url.startsWith('http')) {
        url = `https://${url}`;
      }

      return (
        <motion.a
          key={red.id}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-primary hover:text-white transition-all duration-300"
        >
          <Icon className="w-6 h-6" />
        </motion.a>
      );
    }).filter(Boolean);
  };

  return (
    <footer className="bg-[#1C1C1C] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Logo - ocupa 4 columnas en desktop */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            {headerInfo?.logo?.url ? (
              <motion.img
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                src={headerInfo.logo.url}
                alt={headerInfo.title}
                className="h-20 w-auto" // Logo más grande
              />
            ) : (
              <span className="text-3xl font-bold">{headerInfo?.title || 'Toca Stereo'}</span>
            )}
          </div>

          {/* Apps - ocupa 4 columnas en desktop */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-6">
            <h3 className="text-lg font-bold text-center lg:text-left">
              Descarga nuestra app
            </h3>
            <div className="w-full max-w-xs">
              {renderAppLinks()}
            </div>
          </div>

          {/* Redes sociales - ocupa 4 columnas en desktop */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-6">
            <h3 className="text-lg font-bold text-center lg:text-left">
              Síguenos
            </h3>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              {renderSocialLinks()}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-white/10 text-center"
        >
          <p className="text-sm text-white/60">
            Toca Stereo {currentYear} - Todos los derechos reservados
          </p>
        </motion.div>
      </div>
    </footer>
  );
}