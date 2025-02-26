import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const HeaderContext = createContext(null);

export function HeaderProvider({ children }) {
  const [headerInfo, setHeaderInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHeaderInfo = async () => {
      try {
        const data = await apiService.getHeaderInfo();
        setHeaderInfo(data);
      } catch (error) {
        console.error('Error cargando información del header:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHeaderInfo();
  }, []);

  return (
    <HeaderContext.Provider value={{ headerInfo, isLoading }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader debe usarse dentro de un HeaderProvider');
  }
  return context;
} 