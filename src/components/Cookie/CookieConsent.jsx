import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Siempre activo
    analytics: false,
    advertising: false,
    functional: false
  });
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Verificar si ya se han aceptado las cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    } else {
      // Cargar preferencias guardadas
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch (error) {
        console.error('Error al cargar las preferencias de cookies:', error);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      advertising: true,
      functional: true
    };
    savePreferences(allAccepted);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const savePreferences = (prefs) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setShowPreferences(false);

    // Aplicar preferencias
    if (prefs.analytics) {
      // Habilitar Google Analytics
      window['ga-disable-UA-XXXXX-Y'] = false;
    } else {
      // Deshabilitar Google Analytics
      window['ga-disable-UA-XXXXX-Y'] = true;
    }

    if (prefs.advertising) {
      // Habilitar cookies de publicidad
      (window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 0;
    } else {
      // Deshabilitar cookies de publicidad
      (window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 1;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-[9999]">
      <div className="container mx-auto px-4 py-6">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. 
              Al continuar navegando, aceptas nuestra{' '}
              <Link to="/legal/cookies" className="text-primary hover:underline">
                política de cookies
              </Link>.
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md transition-colors"
              >
                Preferencias
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-dark rounded-md transition-colors"
              >
                Aceptar todo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Preferencias de cookies</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cookies necesarias</h4>
                  <p className="text-sm text-gray-500">
                    Requeridas para el funcionamiento básico del sitio.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="h-4 w-4 text-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cookies analíticas</h4>
                  <p className="text-sm text-gray-500">
                    Nos ayudan a entender cómo usas el sitio.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                  className="h-4 w-4 text-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cookies de publicidad</h4>
                  <p className="text-sm text-gray-500">
                    Utilizadas para mostrarte anuncios relevantes.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.advertising}
                  onChange={(e) =>
                    setPreferences({ ...preferences, advertising: e.target.checked })
                  }
                  className="h-4 w-4 text-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cookies funcionales</h4>
                  <p className="text-sm text-gray-500">
                    Mejoran la funcionalidad del sitio.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) =>
                    setPreferences({ ...preferences, functional: e.target.checked })
                  }
                  className="h-4 w-4 text-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-dark rounded-md transition-colors"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
