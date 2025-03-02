import React, { useState, useEffect, useRef } from 'react';
import { useCity } from '../context/CityContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { constants } from '../services/api';

const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export function ProgramacionPage() {
  const { selectedCity } = useCity();
  const days = [
    { id: 1, name: 'Lunes', short: 'L' },
    { id: 2, name: 'Martes', short: 'M' },
    { id: 3, name: 'Miércoles', short: 'M' },
    { id: 4, name: 'Jueves', short: 'J' },
    { id: 5, name: 'Viernes', short: 'V' },
    { id: 6, name: 'Sábado', short: 'S' },
    { id: 7, name: 'Domingo', short: 'D' }
  ];

  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay();
    return today === 0 ? 7 : today;
  });

  const currentDate = format(new Date(), 'EEEE, d \'de\' MMMM', { locale: es });
  const dayButtonRef = useRef(null);
  const liveArticleRef = useRef(null);

  const getCurrentProgram = () => {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const currentDay = format(now, 'EEEE', { locale: es }).toLowerCase();
  
    return programs.find(program => {
      if (!program.days.includes(currentDay)) return false;
      const start = program.startTime;
      const end = program.endTime;
      return currentTime >= start && currentTime <= end;
    });
  };

  const currentProgram = getCurrentProgram();

  // Add scroll to live program effect
  useEffect(() => {
    if (currentProgram && liveArticleRef.current) {
      liveArticleRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentProgram, programs]);

  // Add scroll to current day effect
  useEffect(() => {
    if (dayButtonRef.current) {
      dayButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedDay, isLoading]);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!selectedCity) return;
  
      setIsLoading(true);
      setError(null);
  
      try {
        console.log('Fetching programs for city:', selectedCity);
        const response = await axios.get(
          `${constants.API_BASE}/ciudades/${selectedCity.documentId || selectedCity.id}?populate[Programa][populate]=*`
        );
        
        console.log('API Response:', response.data);
        const cityData = response.data.data;
        const cityPrograms = cityData?.Programa || [];
        
        console.log('City Programs Data:', cityPrograms);
        
        if (!cityData || !cityPrograms.length) {
          console.log('No programs found in response');
          setPrograms([]);
          setError('No hay programas disponibles');
          return;
        }
        
        const mappedPrograms = cityPrograms.map(program => ({
          id: program.id,
          name: program.program_name,
          description: program.description,
          startTime: program.start_time?.split('.')[0] || program.start_time,
          endTime: program.end_time?.split('.')[0] || program.end_time,
          days: Array.isArray(program.days) ? program.days.map(day => day.toLowerCase().trim()) : [],
          image: program.imgprogram?.url ? `https://api.voltajedigital.com${program.imgprogram.url}` : null
        }));
  
        console.log('Mapped Programs:', mappedPrograms);
        setPrograms(mappedPrograms);
      } catch (err) {
        console.error('Error fetching programs:', err);
        console.log('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Error al cargar la programación');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPrograms();
  }, [selectedCity]);

  const filteredPrograms = programs.filter(program => {
    console.log('Filtering program:', program);
    const dayName = days.find(d => d.id === selectedDay)?.name.toLowerCase();
    // Ensure program.days exists and is an array before trying to use includes
    return program.days && Array.isArray(program.days) && program.days.some(day => 
      day.toLowerCase().trim() === dayName
    );
  });

  if (!selectedCity) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Selecciona una ciudad</h1>
          <p className="text-gray-400">Elige una ciudad para ver la programación disponible</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="animate-pulse space-y-8"
          >
            <div className="space-y-4">
              <div className="h-8 bg-white/10 rounded w-64" />
              <div className="h-6 bg-white/10 rounded w-48" />
            </div>
            <div className="flex gap-2 overflow-x-auto py-2">
              {Array(7).fill(null).map((_, i) => (
                <div key={i} className="w-12 h-12 bg-white/10 rounded-full flex-shrink-0" />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-black via-black/95 to-black/90">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <header className="text-center py-12">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-white to-red-500 bg-clip-text text-transparent mb-4"
            >
              Programación
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-red-500 font-medium text-lg md:text-xl capitalize"
            >
              {currentDate}
            </motion.p>
          </header>

          <nav className="mb-12 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-2 md:gap-3 justify-start md:justify-center min-w-min px-4">
              {days.map((day, index) => (
                <motion.button
                  key={day.id}
                  ref={selectedDay === day.id ? dayButtonRef : null}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedDay(day.id)}
                  className={`relative group px-3 sm:px-6 py-2 sm:py-3 rounded-xl flex flex-col items-center justify-center transition-all duration-300 min-w-[3rem] sm:min-w-[auto] ${
                    selectedDay === day.id
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 scale-105 sm:scale-110 z-10'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:scale-105'
                  }`}
                  aria-label={day.name}
                  aria-pressed={selectedDay === day.id}
                >
                  <span className="text-[0.65rem] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    {day.short}
                  </span>
                  <span className="text-xs sm:text-sm font-medium">{day.name}</span>
                  {selectedDay === day.id && (
                    <motion.div
                      layoutId="dayIndicator"
                      className="absolute -bottom-1 left-1/2 w-8 sm:w-12 h-1 bg-white rounded-full -translate-x-1/2"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </nav>

          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {filteredPrograms.map((program, index) => (
                <motion.article
                  key={program.id}
                  ref={currentProgram?.id === program.id ? liveArticleRef : null}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative pl-16 sm:pl-24 pr-4 sm:pr-6 py-4 sm:py-6 rounded-2xl transition-all duration-500 hover:shadow-2xl overflow-visible"
                >
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-500 z-0 ${currentProgram?.id === program.id ? 'bg-gradient-to-br from-black to-red-900/50 shadow-xl shadow-red-500/10' : 'bg-white/5 backdrop-blur-sm group-hover:bg-white/10'}`} />

                  {/* Live Program Indicator - Now above the background */}
                  {currentProgram?.id === program.id && (
                    <div className="absolute top-0 right-6 -translate-y-1/2 z-20">
                      <span className="inline-flex items-center px-4 py-1 rounded-full bg-red-500 text-white text-sm font-medium shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                        EN DIRECTO
                      </span>
                    </div>
                  )}

                  {/* Program Image - Now above the background */}
                  <div className="absolute left-0 top-0 bottom-0 -translate-x-1/6 sm:-translate-x-1/3 z-20 flex items-center">
                    <div className="w-16 h-16 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 sm:border-4 border-white/10 shadow-xl">
                      {program.image ? (
                        <img
                          src={program.image}
                          alt={program.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                          <svg className="w-8 h-8 text-red-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Program Info - Now above the background */}
                  <div className="relative z-10 flex items-start justify-between gap-4 sm:gap-8 pl-2 sm:pl-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-white group-hover:text-red-500 transition-colors line-clamp-1">
                        {program.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/70 line-clamp-2">
                        {program.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-red-500">
                        {formatTime(program.startTime)}
                      </div>
                      <div className="text-xs sm:text-sm text-white/50">
                        {formatTime(program.endTime)}
                      </div>
                    </div>
                  </div>

                  {currentProgram?.id === program.id && (
                    <div className="absolute inset-0 ring-2 ring-red-500 rounded-2xl pointer-events-none z-10" />
                  )}
                </motion.article>
              ))}
            </AnimatePresence>

            {filteredPrograms.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
                  <svg className="w-16 h-16 text-red-500/50 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-white/60 text-lg">
                    No hay programas disponibles para este día
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}