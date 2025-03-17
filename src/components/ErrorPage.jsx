import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

export const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">¡Oops!</h1>
        <p className="text-xl text-gray-400 mb-8">
          {error.statusText || error.message || 'Algo salió mal'}
        </p>
        <Link
          to="/"
          className="inline-block bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};
