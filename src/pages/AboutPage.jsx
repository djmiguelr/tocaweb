import React from 'react';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';

export function AboutPage() {
  return (
    <>
      <SEO 
        title="Sobre Nosotros - Toca Stereo"
        description="Descubre la historia y el equipo detrás de Toca Stereo. Somos una emisora comprometida con llevar la mejor música y entretenimiento a nuestra comunidad."
        type="website"
      />
      
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <header className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent mb-6">
                Sobre Nosotros
              </h1>
              <p className="text-xl text-gray-400">
                Conectando a nuestra comunidad a través de la música
              </p>
            </header>

            <div className="space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Nuestra Historia
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Toca Stereo nació con la visión de crear un espacio único donde la música y la comunidad se encuentran. 
                  Desde nuestros inicios, nos hemos dedicado a ofrecer contenido de calidad y a ser una plataforma 
                  que conecta artistas con su audiencia.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Nuestra Misión
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Nos esforzamos por ser más que una simple emisora. Nuestra misión es crear experiencias memorables 
                  a través de la música, promover el talento local y construir una comunidad vibrante de amantes 
                  de la música.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Valores
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-primary mb-2">Innovación</h3>
                    <p className="text-gray-400">
                      Constantemente buscamos nuevas formas de mejorar y ofrecer experiencias únicas a nuestra audiencia.
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-primary mb-2">Comunidad</h3>
                    <p className="text-gray-400">
                      Creemos en el poder de la música para unir personas y crear conexiones significativas.
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-primary mb-2">Calidad</h3>
                    <p className="text-gray-400">
                      Nos comprometemos a ofrecer contenido de alta calidad y una experiencia excepcional.
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-primary mb-2">Pasión</h3>
                    <p className="text-gray-400">
                      La música es nuestra pasión, y eso se refleja en todo lo que hacemos.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Nuestro Equipo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 bg-gradient-to-br from-primary/20 to-primary/5"></div>
                    <h3 className="text-xl font-semibold text-white mb-1">Nombre</h3>
                    <p className="text-gray-400">Cargo</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 bg-gradient-to-br from-primary/20 to-primary/5"></div>
                    <h3 className="text-xl font-semibold text-white mb-1">Nombre</h3>
                    <p className="text-gray-400">Cargo</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 bg-gradient-to-br from-primary/20 to-primary/5"></div>
                    <h3 className="text-xl font-semibold text-white mb-1">Nombre</h3>
                    <p className="text-gray-400">Cargo</p>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
