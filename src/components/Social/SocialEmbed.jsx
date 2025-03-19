import React, { useEffect, useRef } from 'react';
import './social-embed.css';

export const SocialEmbed = ({ content }) => {
  const containerRef = useRef(null);

  const detectEmbedType = (content) => {
    if (!content) return null;
    
    const contentLower = content.toLowerCase();
    
    // Detectar Twitter/X
    if (contentLower.includes('twitter.com') || 
        contentLower.includes('x.com') || 
        contentLower.includes('class="twitter-tweet"')) {
      return 'twitter';
    }
    
    // Detectar Instagram
    if (contentLower.includes('instagram.com') || 
        contentLower.includes('class="instagram-media"')) {
      return 'instagram';
    }
    
    // Detectar Facebook
    if (contentLower.includes('facebook.com') || 
        contentLower.includes('class="fb-post"')) {
      return 'facebook';
    }
    
    // Detectar YouTube
    if (contentLower.includes('youtube.com') || 
        contentLower.includes('youtu.be')) {
      return 'youtube';
    }
    
    // Detectar TikTok
    if (contentLower.includes('tiktok.com') || 
        contentLower.includes('class="tiktok-embed"')) {
      return 'tiktok';
    }
    
    return null;
  };

  const type = detectEmbedType(content);

  useEffect(() => {
    if (!content || !containerRef.current || !type) return;

    const loadScript = (src) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        if (type === 'twitter' && window.twttr) {
          window.twttr.widgets.load(containerRef.current);
        }
        if (type === 'instagram' && window.instgrm) {
          window.instgrm.Embeds.process();
        }
        if (type === 'facebook' && window.FB) {
          window.FB.XFBML.parse(containerRef.current);
        }
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (type === 'twitter' && window.twttr) {
          window.twttr.widgets.load(containerRef.current);
        }
        if (type === 'instagram' && window.instgrm) {
          window.instgrm.Embeds.process();
        }
        if (type === 'facebook' && window.FB) {
          window.FB.XFBML.parse(containerRef.current);
        }
      };
    };

    switch (type) {
      case 'twitter':
        loadScript('https://platform.twitter.com/widgets.js');
        break;
      case 'instagram':
        loadScript('https://www.instagram.com/embed.js');
        break;
      case 'facebook':
        window.fbAsyncInit = function() {
          window.FB.init({
            xfbml: true,
            version: 'v18.0'
          });
        };
        loadScript('https://connect.facebook.net/es_LA/sdk.js');
        break;
      case 'tiktok':
        loadScript('https://www.tiktok.com/embed.js');
        break;
    }
  }, [type, content]);

  const getEmbedHtml = () => {
    if (!content || !type) return '';

    switch (type) {
      case 'twitter': {
        if (content.startsWith('http')) {
          const tweetUrl = content.split('?')[0];
          return `<blockquote class="twitter-tweet" data-dnt="true"><a href="${tweetUrl}"></a></blockquote>`;
        }
        return content;
      }

      case 'instagram': {
        if (content.startsWith('http')) {
          return `<blockquote class="instagram-media" data-instgrm-permalink="${content}" data-instgrm-version="14" style="width: 100%;"></blockquote>`;
        }
        return content;
      }

      case 'facebook': {
        if (content.startsWith('http')) {
          return `<div class="fb-post" data-href="${content}" data-width="100%"></div>`;
        }
        return content;
      }

      case 'youtube': {
        const videoId = content.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
        if (!videoId) return '';
        return `<div class="youtube-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      }

      case 'tiktok': {
        if (content.startsWith('http')) {
          const videoId = content.split('/video/')[1]?.split('?')[0];
          if (!videoId) return '';
          return `<blockquote class="tiktok-embed" cite="${content}" data-video-id="${videoId}"><section></section></blockquote>`;
        }
        return content;
      }

      default:
        return '';
    }
  };

  if (!type) {
    return (
      <div className="social-embed">
        <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
          <code className="text-sm text-white font-mono whitespace-pre-wrap break-words">
            {content}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="social-embed">
      <div dangerouslySetInnerHTML={{ __html: getEmbedHtml() }} />
    </div>
  );
};
