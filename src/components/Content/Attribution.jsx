import React from 'react';
import PropTypes from 'prop-types';

export const Attribution = ({ 
  author, 
  source, 
  sourceUrl, 
  license, 
  licenseUrl,
  className = ''
}) => {
  return (
    <div className={`text-sm text-gray-500 ${className}`}>
      {author && (
        <span className="block">
          Autor: {author}
        </span>
      )}
      {source && (
        <span className="block">
          Fuente:{' '}
          {sourceUrl ? (
            <a 
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {source}
            </a>
          ) : (
            source
          )}
        </span>
      )}
      {license && (
        <span className="block">
          Licencia:{' '}
          {licenseUrl ? (
            <a 
              href={licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {license}
            </a>
          ) : (
            license
          )}
        </span>
      )}
    </div>
  );
};

Attribution.propTypes = {
  author: PropTypes.string,
  source: PropTypes.string,
  sourceUrl: PropTypes.string,
  license: PropTypes.string,
  licenseUrl: PropTypes.string,
  className: PropTypes.string
};
