import React, { useEffect, useRef } from 'react';
import './social-embed.css';

export const SocialEmbed = ({ content }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!content || !containerRef.current) return;

    const loadScript = (src) => {
      return new Promise((resolve) => {
        // Limpiar la URL del script
        const cleanSrc = src.replace(/^\/\//, 'https://');
        
        const existingScript = document.querySelector(`script[src="${cleanSrc}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = cleanSrc;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.body.appendChild(script);
        script.onload = resolve;
      });
    };

    const initializeEmbed = async () => {
      try {
        // Limpiar el contenido
        let cleanContent = content
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&')
          .trim();

        // Extraer scripts del contenido
        const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/g;
        const scripts = [];
        let match;
        
        while ((match = scriptRegex.exec(cleanContent)) !== null) {
          scripts.push(match[1]);
        }

        // Procesar según el tipo de contenido
        if (cleanContent.includes('twitter.com/') || cleanContent.includes('x.com/')) {
          if (!cleanContent.includes('class="twitter-tweet"')) {
            cleanContent = `<blockquote class="twitter-tweet">${cleanContent}</blockquote>`;
          }
          await loadScript('https://platform.twitter.com/widgets.js');
          if (window.twttr) {
            window.twttr.widgets.load(containerRef.current);
          }
        }
        else if (cleanContent.includes('instagram.com/')) {
          if (!cleanContent.includes('class="instagram-media"')) {
            cleanContent = `<blockquote class="instagram-media" data-instgrm-captioned>${cleanContent}</blockquote>`;
          }
          // Asegurarnos de cargar el script de Instagram
          await loadScript('https://www.instagram.com/embed.js');
          if (window.instgrm) {
            window.instgrm.Embeds.process();
          }
        }
        else if (cleanContent.includes('facebook.com/')) {
          if (!cleanContent.includes('class="fb-post"')) {
            cleanContent = `<div class="fb-post" data-href="${cleanContent}"></div>`;
          }
          await loadScript('https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v18.0');
          if (!window.FB) {
            window.fbAsyncInit = function() {
              FB.init({
                xfbml: true,
                version: 'v18.0'
              });
              FB.XFBML.parse(containerRef.current);
            };
          } else {
            window.FB.XFBML.parse(containerRef.current);
          }
        }
        else if (cleanContent.includes('youtube.com/') || cleanContent.includes('youtu.be/')) {
          const videoId = cleanContent.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
          if (videoId) {
            cleanContent = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
          }
        }
        else if (cleanContent.includes('tiktok.com/')) {
          if (!cleanContent.includes('class="tiktok-embed"')) {
            cleanContent = `<blockquote class="tiktok-embed">${cleanContent}</blockquote>`;
          }
          await loadScript('https://www.tiktok.com/embed.js');
        }

        // Actualizar el contenido
        containerRef.current.innerHTML = cleanContent;

        // Cargar scripts adicionales encontrados en el contenido
        for (const scriptSrc of scripts) {
          await loadScript(scriptSrc);
        }

      } catch (error) {
        console.error('Error al inicializar el embebido:', error);
      }
    };

    initializeEmbed();
  }, [content]);

  return (
    <div className="social-embed-container">
      <div ref={containerRef} className="social-embed" />
    </div>
  );
};
