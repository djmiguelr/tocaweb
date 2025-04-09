import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const SiteMap = () => {
  const sections = [
    {
      title: 'Principal',
      links: [
        { name: 'Inicio', path: '/' },
        { name: 'Noticias', path: '/noticias' },
        { name: 'Programación', path: '/programacion' },
        { name: 'Eventos', path: '/eventos' },
        { name: 'Entrevistas', path: '/entrevistas' },
        { name: 'En Vivo', path: '/live' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Política de Privacidad', path: '/legal/privacidad' },
        { name: 'Términos y Condiciones', path: '/legal/terminos' },
        { name: 'Política de Cookies', path: '/legal/cookies' },
        { name: 'Aviso Legal', path: '/legal/aviso-legal' },
      ]
    },
    {
      title: 'Categorías',
      links: [
        { name: 'Música', path: '/tags/musica' },
        { name: 'Entretenimiento', path: '/tags/entretenimiento' },
        { name: 'Cultura', path: '/tags/cultura' },
        { name: 'Tecnología', path: '/tags/tecnologia' },
      ]
    },
    {
      title: 'Redes Sociales',
      links: [
        { name: 'Facebook', path: 'https://facebook.com/tocastereo', external: true },
        { name: 'Twitter', path: 'https://twitter.com/tocastereo', external: true },
        { name: 'Instagram', path: 'https://instagram.com/tocastereo', external: true },
        { name: 'YouTube', path: 'https://youtube.com/tocastereo', external: true },
      ]
    },
  ];

  return (
    <>
      <SEO 
        title="Mapa del Sitio - Toca Stereo"
        description="Explora todas las secciones y páginas de Toca Stereo de manera fácil y organizada."
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mapa del Sitio</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.path}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-primary transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-gray-600 hover:text-primary transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
