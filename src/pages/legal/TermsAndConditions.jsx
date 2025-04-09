import React from 'react';
import { SEO } from '../../components/SEO';

export const TermsAndConditions = () => (
  <>
    <SEO 
      title="Términos y Condiciones - Toca Stereo" 
      description="Términos y condiciones de uso de Toca Stereo. Conoce las reglas y políticas que rigen el uso de nuestro sitio."
    />
    <div className="min-h-screen bg-[#1C1C1C] text-white">
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center text-primary">Términos y Condiciones</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">1. Aceptación de los Términos</h2>
            <p className="mb-4">
              Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguno de estos términos, le rogamos que no utilice nuestro sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">2. Propiedad Intelectual</h2>
            <p className="mb-4">
              Todo el contenido presente en este sitio web, incluyendo pero no limitado a textos, gráficos, logos, imágenes, clips de audio, descargas digitales y compilaciones de datos, es propiedad de Toca Stereo o de sus proveedores de contenido y está protegido por las leyes de propiedad intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">3. Uso Permitido</h2>
            <p className="mb-4">
              Se permite:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Acceder y visualizar el contenido para uso personal</li>
              <li>Compartir enlaces a nuestro contenido</li>
              <li>Citar pequeños fragmentos con atribución adecuada</li>
            </ul>
            <p className="mb-4">
              No se permite:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Copiar o reproducir el contenido sin autorización</li>
              <li>Modificar o alterar el contenido</li>
              <li>Usar el contenido con fines comerciales sin permiso</li>
              <li>Realizar ingeniería inversa del sitio</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">4. Publicidad y Enlaces</h2>
            <p className="mb-4">
              Este sitio web contiene anuncios proporcionados por Google AdSense y otros proveedores de publicidad. Los anunciantes pueden usar cookies y tecnologías similares para recopilar información sobre sus visitas a este y otros sitios web.
            </p>
            <p className="mb-4">
              Los enlaces a sitios web de terceros se proporcionan únicamente para su conveniencia. No tenemos control sobre el contenido de estos sitios y no asumimos responsabilidad por ellos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">5. Contenido del Usuario</h2>
            <p className="mb-4">
              Al enviar comentarios o cualquier otro contenido a nuestro sitio, usted garantiza que:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Tiene el derecho de proporcionar dicho contenido</li>
              <li>El contenido no es ilegal ni ofensivo</li>
              <li>El contenido no infringe derechos de terceros</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">6. Limitación de Responsabilidad</h2>
            <p className="mb-4">
              Toca Stereo no será responsable por daños directos, indirectos, incidentales, consecuentes o punitivos que resulten del uso o la imposibilidad de usar nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">7. Modificaciones</h2>
            <p className="mb-4">
              Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">8. Contacto</h2>
            <p className="mb-4">
              Para cualquier pregunta sobre estos términos y condiciones, puede contactarnos en:
              <br />
              Email: legal@tocastereo.co
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
