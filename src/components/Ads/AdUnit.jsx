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
      if (adRef.current && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error al cargar el anuncio:', error);
    }
  }, []);

  if (!slot) {
    console.warn('AdUnit: No se proporcionó el slot del anuncio');
    return null;
  }

  return (
    <div className="ad-container my-6">
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
