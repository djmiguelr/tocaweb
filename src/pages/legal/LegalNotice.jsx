import React from 'react';
import { SEO } from '../../components/SEO';

export const LegalNotice = () => (
  <>
    <SEO 
      title="Aviso Legal - Toca Stereo" 
      description="Aviso legal de Toca Stereo. Información sobre derechos de autor, responsabilidades y limitaciones."
    />
    <div className="min-h-screen bg-[#1C1C1C] text-white">
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center text-primary">Aviso Legal</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">1. Información General</h2>
            <p className="mb-4">
              Toca Stereo es un medio de comunicación digital operado por [Nombre de la Empresa], 
              con domicilio en [Dirección], inscrita en el Registro Mercantil de [Ciudad] con NIT [Número].
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">2. Propiedad Intelectual</h2>
            <p className="mb-4">
              Todo el contenido de este sitio web (incluyendo, pero no limitado a, texto, gráficos, 
              logotipos, iconos, imágenes, clips de audio, descargas digitales y recopilaciones de datos) 
              es propiedad de Toca Stereo o de sus proveedores de contenido y está protegido por las leyes 
              de propiedad intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">3. Licencias y Permisos</h2>
            <p className="mb-4">
              El contenido proporcionado en este sitio web está licenciado bajo diferentes términos:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Contenido editorial: Todos los derechos reservados © Toca Stereo</li>
              <li>Música: Licenciada a través de SAYCO y ACINPRO</li>
              <li>Imágenes: Atribuidas individualmente según su licencia</li>
              <li>Contenido de usuarios: Bajo licencia Creative Commons cuando aplique</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">4. Responsabilidad y Garantías</h2>
            <p className="mb-4">
              Toca Stereo se esfuerza por mantener la información de este sitio web actualizada y precisa. 
              Sin embargo, no podemos garantizar que el contenido esté libre de errores o que el sitio web 
              funcione sin interrupciones.
            </p>
            <p className="mb-4">
              No nos hacemos responsables de:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Interrupciones en el servicio por causas técnicas</li>
              <li>Contenido generado por usuarios</li>
              <li>Enlaces a sitios web de terceros</li>
              <li>Pérdidas indirectas derivadas del uso del sitio</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">5. Legislación Aplicable</h2>
            <p className="mb-4">
              Este aviso legal se rige por la legislación colombiana. Cualquier disputa relacionada con 
              este sitio web estará sujeta a la jurisdicción exclusiva de los tribunales de [Ciudad].
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">6. Modificaciones</h2>
            <p className="mb-4">
              Nos reservamos el derecho de modificar este aviso legal en cualquier momento. Los cambios 
              entrarán en vigor inmediatamente después de su publicación en el sitio web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">7. Contacto</h2>
            <p className="mb-4">
              Para cualquier consulta relacionada con este aviso legal, puede contactarnos en:
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
