import React from 'react';
import { SEO } from '../../components/SEO';

export const CookiePolicy = () => (
  <>
    <SEO 
      title="Política de Cookies - Toca Stereo" 
      description="Política de cookies de Toca Stereo. Aprende cómo utilizamos las cookies en nuestro sitio web."
    />
    <div className="min-h-screen bg-[#1C1C1C] text-white">
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center text-primary">Política de Cookies</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">1. ¿Qué son las cookies?</h2>
            <p className="mb-4">
              Las cookies son pequeños archivos de texto que los sitios web colocan en su dispositivo cuando los visita. 
              Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente y proporcionar información a los propietarios del sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">2. Tipos de cookies que utilizamos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Cookies necesarias</h3>
                <p className="text-gray-600">
                  Son esenciales para que pueda navegar por el sitio web y utilizar sus funciones.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Cookies analíticas</h3>
                <p className="text-gray-600">
                  Nos ayudan a entender cómo interactúan los visitantes con el sitio web, recopilando y reportando información de forma anónima.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Cookies de publicidad</h3>
                <p className="text-gray-600">
                  Se utilizan para rastrear a los visitantes en los sitios web. La intención es mostrar anuncios relevantes y atractivos para el usuario individual.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Cookies funcionales</h3>
                <p className="text-gray-600">
                  Ayudan a realizar ciertas funcionalidades como compartir el contenido del sitio web en plataformas de redes sociales o recopilar comentarios.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">3. Cookies de terceros</h2>
            <p className="mb-4">
              Nuestro sitio web utiliza servicios de terceros que también pueden establecer cookies en su dispositivo cuando visita nuestro sitio. Estos servicios incluyen:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Google Analytics (análisis de uso del sitio)</li>
              <li>Google AdSense (publicidad)</li>
              <li>Redes sociales (botones de compartir)</li>
              <li>Servicios de reproducción de medios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">4. Gestión de cookies</h2>
            <p className="mb-4">
              Puede gestionar sus preferencias de cookies en cualquier momento utilizando nuestro panel de preferencias de cookies. Además, la mayoría de los navegadores web le permiten controlar las cookies a través de sus preferencias de configuración.
            </p>
            <button 
              onClick={() => window.dispatchEvent(new Event('openCookieConsent'))}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Gestionar preferencias de cookies
            </button>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">5. Más información</h2>
            <p className="mb-4">
              Para obtener más información sobre cómo utilizamos las cookies, puede contactarnos en:
              <br />
              Email: privacy@tocastereo.co
            </p>
          </section>

          <div className="text-sm text-white/40 text-center mt-12">
            Última actualización: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  </>
);
