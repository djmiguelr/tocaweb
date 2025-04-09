import React from 'react';
import { SEO } from '../../components/SEO';

export const PrivacyPolicy = () => (
  <>
    <SEO 
      title="Política de Privacidad - Toca Stereo" 
      description="Política de privacidad de Toca Stereo. Aprende cómo recopilamos, usamos y protegemos tu información."
    />
    <div className="min-h-screen bg-[#1C1C1C] text-white">
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center text-primary">Política de Privacidad</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">1. Información que Recopilamos</h2>
            <p className="mb-4">
              En Toca Stereo, recopilamos la siguiente información:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Información de uso del sitio web</li>
              <li>Información del dispositivo y navegador</li>
              <li>Cookies y tecnologías similares</li>
              <li>Información proporcionada voluntariamente en formularios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">2. Uso de la Información</h2>
            <p className="mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Personalizar la experiencia del usuario</li>
              <li>Analizar el uso del sitio</li>
              <li>Comunicarnos con los usuarios</li>
              <li>Mostrar publicidad relevante</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">3. Publicidad</h2>
            <p className="mb-4">
              Utilizamos Google AdSense para mostrar anuncios. Google AdSense usa cookies para mostrar anuncios basados en visitas previas a nuestro sitio u otros sitios web. Puedes inhabilitar la publicidad personalizada visitando www.google.com/settings/ads.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">4. Derechos del Usuario</h2>
            <p className="mb-4">
              Los usuarios tienen derecho a:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Acceder a su información personal</li>
              <li>Rectificar información incorrecta</li>
              <li>Solicitar la eliminación de datos</li>
              <li>Oponerse al procesamiento de datos</li>
              <li>Retirar el consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">5. Seguridad</h2>
            <p className="mb-4">
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra el acceso, uso o divulgación no autorizados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">6. Contacto</h2>
            <p className="mb-4">
              Para cualquier pregunta sobre esta política de privacidad, puede contactarnos en:
              <br />
              Email: privacy@tocastereo.co
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">7. Cambios en la Política</h2>
            <p className="mb-4">
              Nos reservamos el derecho de modificar esta política de privacidad en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.
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
