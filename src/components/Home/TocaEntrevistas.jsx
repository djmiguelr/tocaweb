import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

function EntrevistaCard({ entrevista }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      <div className="relative group">
        <img
          src={entrevista.attributes.portada.data.attributes.url}
          alt={entrevista.attributes.titulo}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Overlay con ícono de play */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg 
            className="w-16 h-16 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg line-clamp-2">
          {entrevista.attributes.titulo}
        </h3>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {entrevista.attributes.description}
        </p>
      </div>
    </div>
  );
}

export function TocaEntrevistas() {
  const [entrevistas, setEntrevistas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEntrevistas = async () => {
      try {
        const data = await api.getTocaEntrevistas();
        setEntrevistas(data.filter(entrevista => entrevista?.attributes?.slugentre));
      } catch (error) {
        console.error('Error loading interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntrevistas();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-200 h-80 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (entrevistas.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Toca Entrevistas</h2>
          <Link
            to="/entrevistas"
            className="text-primary hover:text-primary-dark font-medium"
          >
            Ver más
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entrevistas.map(entrevista => (
            <Link 
              key={entrevista.id} 
              to={`/entrevistas/${entrevista.attributes.slugentre}`}
            >
              <EntrevistaCard entrevista={entrevista} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 