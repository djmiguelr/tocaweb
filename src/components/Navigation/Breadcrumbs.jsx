import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiChevronRight } from 'react-icons/hi';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Mapeo de rutas a nombres legibles
  const routeNames = {
    noticias: 'Noticias',
    programacion: 'Programación',
    eventos: 'Eventos',
    entrevistas: 'Entrevistas',
    live: 'En Vivo',
    legal: 'Legal',
    privacidad: 'Política de Privacidad',
    terminos: 'Términos y Condiciones',
    cookies: 'Política de Cookies',
    'aviso-legal': 'Aviso Legal',
    tags: 'Etiquetas',
    autor: 'Autor'
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link
            to="/"
            className="text-gray-400 hover:text-primary transition-colors duration-200"
          >
            Inicio
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          return (
            <React.Fragment key={to}>
              <li className="text-gray-600">
                <HiChevronRight className="w-4 h-4" />
              </li>
              <li>
                {last ? (
                  <span className="text-primary font-medium">
                    {routeNames[value] || value}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    {routeNames[value] || value}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
