import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { apiService, constants } from '../../services/api';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

export function MainSlider() {
  const [sliders, setSliders] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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
    if (!slider.horario?.inicio || !slider.horario?.fin || !slider.horario?.dias?.length) {
      return true; // Si no tiene horario, se muestra siempre
    }

    const now = new Date();
    const currentDay = dayMapping[now.toLocaleString('en-US', { weekday: 'long' })];
    
    // Verificar si el día actual está en los días permitidos
    if (!slider.horario.dias.includes(currentDay)) {
      return false;
    }

    // Convertir horarios a minutos para comparación
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = slider.horario.inicio.split(':').map(Number);
    const [endHour, endMinute] = slider.horario.fin.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    return currentTime >= startTime && currentTime <= endTime;
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
    const loadSliders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiService.getSliders();
        
        // Guardar todos los sliders
        setSliders(data);
        
        // Filtrar sliders según horario
        const filtered = data.filter(slider => shouldShowSlider(slider));
        setActiveSliders(filtered);
      } catch (err) {
        console.error('Error loading sliders:', err);
        setError('Error al cargar los sliders');
      } finally {
        setIsLoading(false);
      }
    };

    loadSliders();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === activeSliders.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? activeSliders.length - 1 : prevIndex - 1
    );
  };

  // Auto-avance cada 10 segundos
  useEffect(() => {
    if (activeSliders.length <= 1) return;
    
    const timer = setInterval(nextSlide, 10000);
    return () => clearInterval(timer);
  }, [activeSliders.length]);

  if (isLoading) {
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
        {/* Contenedor del Slider con aspect ratio adaptativo */}
        <div className="relative w-full overflow-hidden">
          <div className="md:aspect-[192/85] aspect-[10/11]">
            <AnimatePresence mode="wait">
              {activeSliders.map((slider, index) => {
                if (!slider) return null;

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
                        to={slider.URLslider || '#'} 
                        className="relative w-full h-full block group"
                      >
                        {/* Imagen con blur de fondo */}
                        <div className="absolute inset-0 blur-2xl scale-110">
                          <img
                            src={slider.imagen?.url || '/placeholder.jpg'}
                            alt={slider.title || ''}
                            className="w-full h-full object-cover opacity-30"
                          />
                        </div>

                        {/* Imagen principal */}
                        <picture className="relative h-full z-10">
                          {slider.imgrespon && (
                            <source
                              media="(max-width: 768px)"
                              srcSet={slider.imgrespon.url}
                            />
                          )}
                          <img
                            src={slider.imagen?.url || '/placeholder.jpg'}
                            alt={slider.title || ''}
                            className="w-full h-full md:object-contain object-cover"
                          />
                        </picture>
                        
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
                            {slider.title}
                          </h2>
                          {/* Solo mostrar el badge de horario si hay datos */}
                          {slider.horario?.inicio && slider.horario?.fin && slider.horario?.dias && slider.horario?.dias.length > 0 && (
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/80 backdrop-blur-sm text-white text-sm">
                              <span className="mr-2 animate-pulse">●</span>
                              <span className="hidden sm:inline">Disponible:</span>{' '}
                              {slider.horario.dias.map((dia, index) => (
                                <span key={dia}>
                                  {index > 0 && ', '}
                                  {dia}
                                </span>
                              ))}{' '}
                              • {formatTime(slider.horario.inicio)} a {formatTime(slider.horario.fin)}
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

export default MainSlider; 