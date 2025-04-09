import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Attribution } from './Attribution';

export const ResponsiveImage = ({
  src,
  alt,
  className = '',
  sizes = '100vw',
  loading = 'lazy',
  attribution,
  fallbackSrc = '/images/placeholder.jpg'
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Generar srcSet para diferentes tamaños de pantalla
  const generateSrcSet = (originalSrc) => {
    if (!originalSrc) return '';
    
    // Extraer la extensión del archivo
    const ext = originalSrc.split('.').pop();
    const basePath = originalSrc.substring(0, originalSrc.lastIndexOf('.'));
    
    // Generar diferentes tamaños
    const widths = [320, 640, 768, 1024, 1280, 1536];
    return widths
      .map(width => `${basePath}-${width}.${ext} ${width}w`)
      .join(', ');
  };

  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  return (
    <div className="relative">
      {/* Placeholder mientras carga */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <img
        src={error ? fallbackSrc : src}
        srcSet={!error ? generateSrcSet(src) : ''}
        sizes={sizes}
        alt={alt}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        className={`w-full h-auto ${className} ${
          loaded ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-300`}
      />

      {/* Atribución */}
      {attribution && (
        <Attribution 
          {...attribution}
          className="mt-2"
        />
      )}
    </div>
  );
};

ResponsiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  sizes: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  attribution: PropTypes.shape({
    author: PropTypes.string,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
    license: PropTypes.string,
    licenseUrl: PropTypes.string
  }),
  fallbackSrc: PropTypes.string
};
