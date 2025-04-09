import React, { useEffect, useRef, useState } from 'react';
import './social-embed.css';

// Configuración de SDKs sociales
const SOCIAL_SDKS = {
  facebook: {
    src: 'https://connect.facebook.net/es_LA/sdk.js',
    global: 'FB',
    init: (FB) => FB.init({ xfbml: true, version: 'v18.0' })
  },
  instagram: {
    src: 'https://www.instagram.com/embed.js',
    global: 'instgrm'
  },
  twitter: {
    src: 'https://platform.twitter.com/widgets.js',
    global: 'twttr'
  },
  tiktok: {
    src: 'https://www.tiktok.com/embed.js',
    global: 'TikTok'
  }
};

export const SocialEmbed = ({ content }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!content || !containerRef.current) return;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
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
        script.onerror = reject;
      });
    };

    const initializeEmbed = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!content) throw new Error('No se proporcionó contenido para embeber');

        let cleanContent = content
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&')
          .trim();

        if (cleanContent.includes('<script>') || cleanContent.includes('javascript:')) {
          throw new Error('Contenido no seguro detectado');
        }

        // Detectar el tipo de embed basado en el contenido
        const isVideoEmbed = cleanContent.includes('plugins/video.php');
        const isInstagramEmbed = cleanContent.includes('instagram.com/p/');
        const isTwitterEmbed = cleanContent.includes('twitter-tweet') || cleanContent.includes('tweets/');
        const isTikTokEmbed = cleanContent.includes('tiktok.com/');
        const isYouTubeEmbed = cleanContent.includes('youtube.com/') || cleanContent.includes('youtu.be/');

        // Extraer scripts del contenido
        const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/g;
        const scripts = [];
        let match;
        
        while ((match = scriptRegex.exec(cleanContent)) !== null) {
          scripts.push(match[1]);
        }

        // Procesar según el tipo de contenido
        if (isTwitterEmbed) {
          // Mantener los atributos originales si existen
          if (!cleanContent.includes('class="twitter-tweet"')) {
            cleanContent = `<blockquote class="twitter-tweet" data-media-max-width="560">${cleanContent}</blockquote>`;
          }
          await loadScript(SOCIAL_SDKS.twitter.src);
          if (window.twttr) {
            window.twttr.widgets.load(containerRef.current);
          }
        }
        else if (isInstagramEmbed) {
          // Preservar el markup original de Instagram si existe
          if (!cleanContent.includes('class="instagram-media"')) {
            const url = cleanContent.match(/https?:\/\/(?:www\.)?instagram\.com\/p\/[^\s<\/?]+/)?.[0];
            if (!url) throw new Error('URL de Instagram no válida');
            cleanContent = `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${url}/?utm_source=ig_embed" data-instgrm-version="14">${cleanContent}</blockquote>`;
          }

          await loadScript(SOCIAL_SDKS.instagram.src);
          
          // Intentar procesar varias veces si es necesario
          let attempts = 0;
          const processEmbed = () => {
            if (window.instgrm) {
              window.instgrm.Embeds.process();
            } else if (attempts < 3) {
              attempts++;
              setTimeout(processEmbed, 1000);
            }
          };
          processEmbed();
        }
        else if (cleanContent.includes('facebook.com/')) {
          if (isVideoEmbed) {
            // Mantener el iframe original para videos de Facebook
            if (!cleanContent.includes('<iframe')) {
              const url = cleanContent.match(/href=(["'])(.*?)\1/)?.[2];
              if (!url) throw new Error('URL de Facebook no válida');
              cleanContent = `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false" width="560" height="314" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
            }
          } else {
            const url = cleanContent.match(/https?:\/\/[^\s<]+/)?.[0];
            if (!url) throw new Error('URL de Facebook no válida');
            cleanContent = `<div class="fb-post" data-href="${url}" data-width="auto"></div>`;
          }

          await loadScript(SOCIAL_SDKS.facebook.src);
          
          if (!window.FB) {
            window.fbAsyncInit = function() {
              SOCIAL_SDKS.facebook.init(FB);
              FB.XFBML.parse(containerRef.current);
            };
          } else {
            window.FB.XFBML.parse(containerRef.current);
          }
        }
        else if (isYouTubeEmbed) {
          if (!cleanContent.includes('<iframe')) {
            // Si solo tenemos la URL, extraer el ID y crear el iframe
            const videoId = cleanContent.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
            if (!videoId) throw new Error('URL de YouTube no válida');
            
            cleanContent = `<iframe 
              width="560" 
              height="315" 
              src="https://www.youtube.com/embed/${videoId}" 
              title="YouTube video player" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerpolicy="strict-origin-when-cross-origin" 
              allowfullscreen
            ></iframe>`;
          } else {
            // Si ya tenemos un iframe, asegurarnos de que tenga todos los atributos necesarios
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cleanContent;
            const iframe = tempDiv.querySelector('iframe');
            
            if (iframe) {
              // Asegurar que tenga los atributos correctos
              iframe.setAttribute('frameborder', '0');
              iframe.setAttribute('allowfullscreen', '');
              iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
              iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
              
              if (!iframe.getAttribute('title')) {
                iframe.setAttribute('title', 'YouTube video player');
              }
              
              cleanContent = tempDiv.innerHTML;
            }
          }
        }
        else if (isTikTokEmbed) {
          // Preservar el markup original de TikTok si existe
          if (!cleanContent.includes('class="tiktok-embed"')) {
            const url = cleanContent.match(/https?:\/\/(?:www\.)?tiktok\.com\/[^\s<]+/)?.[0];
            if (!url) throw new Error('URL de TikTok no válida');
            const videoId = url.split('/').pop();
            cleanContent = `<blockquote class="tiktok-embed" cite="${url}" data-video-id="${videoId}" style="max-width: 605px;min-width: 325px;">
              <section><a target="_blank" href="${url}">Ver en TikTok</a></section>
            </blockquote>`;
          }

          await loadScript(SOCIAL_SDKS.tiktok.src);
          
          // TikTok necesita un pequeño delay para inicializarse correctamente
          setTimeout(() => {
            if (window.TikTok) {
              window.TikTok.reload();
            }
          }, 500);
        }

        // Actualizar el contenido
        containerRef.current.innerHTML = cleanContent;

        // Cargar scripts adicionales encontrados en el contenido
        for (const scriptSrc of scripts) {
          await loadScript(scriptSrc);
        }

      } catch (error) {
        console.error('Error al inicializar el embebido:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeEmbed();
  }, [content]);

  return (
    <div className="social-embed-container">
      {isLoading && (
        <div className="flex items-center justify-center h-[300px] bg-[#2A2A2A] rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center h-[300px] bg-[#2A2A2A] rounded-lg text-red-500 p-4 text-center">
          {error}
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`social-embed ${isLoading ? 'hidden' : ''}`} 
      />
    </div>
  );
};
