import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

export const AdUnit = ({ 
  slot, 
  format = 'auto',
  responsive = true,
  style = {}
}) => {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      const currentAd = adRef.current;
      if (currentAd && window.adsbygoogle) {
        // Verificar si el anuncio ya está inicializado
        if (!currentAd.dataset.adInitialized) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          currentAd.dataset.adInitialized = 'true';
        }
      }
    } catch (error) {
      console.error('Error al cargar el anuncio:', error);
    }

    // Cleanup function
    return () => {
      if (adRef.current) {
        delete adRef.current.dataset.adInitialized;
      }
    };
  }, []);

  if (!slot) {
    console.warn('AdUnit: No se proporcionó el slot del anuncio');
    return null;
  }

  return (
    <div className="ad-container my-6 relative">
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-gray-400 text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider z-10">
        Publicidad
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          ...style
        }}
        data-ad-client="ca-pub-6169517990121912"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

AdUnit.propTypes = {
  slot: PropTypes.string.isRequired,
  format: PropTypes.oneOf(['auto', 'horizontal', 'vertical', 'rectangle']),
  responsive: PropTypes.bool,
  style: PropTypes.object
};
