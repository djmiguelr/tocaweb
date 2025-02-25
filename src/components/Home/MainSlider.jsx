import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../services/api';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

export function MainSlider() {
  const [sliders, setSliders] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSliders, setActiveSliders] = useState([]);

  // Mapeo de días en inglés a español
  const dayMapping = {
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado',
    'Sunday': 'Domingo'
  };

  // Verificar si un slider debe mostrarse según horario y día
  const shouldShowSlider = (slider) => {
    try {
      // Acceder a los datos correctamente desde la estructura de la API
      const sliderData = slider?.attributes || slider;

      // Si no hay datos de horario o días, mostrar el slider siempre
      if (!sliderData?.HoraInicio || !sliderData?.HoraFin || !Array.isArray(sliderData?.dias)) {
        return true;
      }

      // Si no hay días configurados, mostrar siempre
      if (!sliderData.dias.length) {
        return true;
      }

      // Configurar zona horaria de Colombia
      const now = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
      const colombiaDate = new Date(now);
      
      // Obtener hora y minutos actuales
      const currentTime = colombiaDate.getHours() * 60 + colombiaDate.getMinutes();
      
      // Obtener día actual en español
      const currentDay = dayMapping[colombiaDate.toLocaleDateString('en-US', { weekday: 'long' })]?.toLowerCase();

      // Si no se pudo obtener el día actual, mostrar el slider
      if (!currentDay) {
        return true;
      }

      // Verificar si el día actual está en los días permitidos
      const isValidDay = sliderData.dias.some(day => {
        if (!day || typeof day !== 'string') return false;
        return day.toLowerCase() === currentDay;
      });

      // Si no hay horarios válidos, mostrar el slider
      if (!sliderData.HoraInicio?.includes(':') || !sliderData.HoraFin?.includes(':')) {
        return true;
      }

      // Convertir horarios a minutos de forma segura
      const [startHour = 0, startMinute = 0] = (sliderData.HoraInicio || '').split(':').map(Number);
      const [endHour = 24, endMinute = 0] = (sliderData.HoraFin || '').split(':').map(Number);
      
      // Verificar que los números sean válidos
      if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
        return true;
      }

      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      // Verificar si estamos dentro del horario permitido
      const isValidTime = currentTime >= startTime && currentTime <= endTime;

      return isValidDay && isValidTime;
    } catch (error) {
      console.error('Error en shouldShowSlider:', error);
      // Si hay algún error en la validación, mostrar el slider por defecto
      return true;
    }
  };

  // Formatear horario para mostrar
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/sliders?populate=*`);
        const data = await response.json();
        console.log('Sliders data:', data);
        
        if (!data?.data) {
          throw new Error('No se encontraron sliders');
        }

        const fetchedSliders = data.data;
        setSliders(fetchedSliders);
        
        // Filtrar sliders según horario
        const filtered = fetchedSliders.filter(slider => slider && shouldShowSlider(slider));
        setActiveSliders(filtered);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sliders:', error);
        setError('Error cargando los sliders');
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSliders.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSliders.length) % activeSliders.length);
  };

  // Auto-avance cada 10 segundos
  useEffect(() => {
    if (activeSliders.length <= 1) return;
    
    const timer = setInterval(nextSlide, 10000);
    return () => clearInterval(timer);
  }, [activeSliders.length]);

  if (loading) {
    return (
      <div className="w-full h-[535px] bg-gradient-to-r from-gray-900 to-gray-800 animate-pulse rounded-2xl">
        <div className="flex items-center justify-center h-full text-white/50">
          Cargando slider...
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Error state:', error);
    return (
      <div className="w-full h-[535px] bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl">
        <div className="flex items-center justify-center h-full text-white/50">
          {error}
        </div>
      </div>
    );
  }

  if (activeSliders.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#1C1C1C] rounded-xl overflow-hidden">
      <div className="space-y-6">
        {/* Contenedor del Slider con aspect ratio 192:85 */}
        <div className="relative w-full overflow-hidden">
          <div className="aspect-[192/85]">
            <AnimatePresence mode="wait">
              {activeSliders.map((slider, index) => {
                if (!slider) return null;
                const sliderData = slider?.attributes || slider;
                if (!sliderData) return null;

                // Obtener la URL de la imagen de forma segura
                const imageUrl = sliderData?.imagen?.data?.attributes?.url || 
                               sliderData?.imagen?.url;

                if (!imageUrl) return null;

                return (
                  index === currentIndex && (
                    <motion.div
                      key={slider.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <Link 
                        to={sliderData?.URLslider || '#'} 
                        className="relative w-full h-full block group"
                      >
                        {/* Imagen con blur de fondo */}
                        <div className="absolute inset-0 blur-2xl scale-110">
                          <img
                            src={`${BASE_URL}${imageUrl}`}
                            alt={sliderData.title || ''}
                            className="w-full h-full object-cover opacity-30"
                          />
                        </div>

                        {/* Imagen principal */}
                        <div className="relative h-full z-10">
                          <img
                            src={`${BASE_URL}${imageUrl}`}
                            alt={sliderData.title || ''}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        
                        {/* Overlay gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 z-20" />
                        
                        {/* Información en la imagen */}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-30"
                        >
                          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-2">
                            {sliderData.title}
                          </h2>
                          {/* Solo mostrar el badge de horario si hay datos */}
                          {sliderData.HoraInicio && sliderData.HoraFin && sliderData.dias && sliderData.dias.length > 0 && (
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/80 backdrop-blur-sm text-white text-sm">
                              <span className="mr-2 animate-pulse">●</span>
                              <span className="hidden sm:inline">Disponible:</span>{' '}
                              {sliderData.dias.map((dia, index) => (
                                <span key={dia}>
                                  {index > 0 && ', '}
                                  {dia}
                                </span>
                              ))}{' '}
                              • {formatTime(sliderData.HoraInicio)} a {formatTime(sliderData.HoraFin)}
                            </div>
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  )
                );
              })}
            </AnimatePresence>

            {/* Controles de navegación */}
            {activeSliders.length > 1 && (
              <>
                {/* Botones laterales */}
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-40">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      prevSlide();
                    }}
                    className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:bg-primary"
                  >
                    <BiChevronLeft className="w-6 h-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      nextSlide();
                    }}
                    className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:bg-primary"
                  >
                    <BiChevronRight className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
                  {activeSliders.map((_, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentIndex 
                          ? 'bg-primary w-8' 
                          : 'bg-white/50 w-4 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 