import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Habilitar compresión gzip
app.use(compression());

// Definir la ruta absoluta al directorio dist
const distPath = '/var/www/tocaweb/dist';

// Servir archivos estáticos desde el directorio dist
app.use(express.static(distPath));

// Función para obtener la URL de la imagen destacada
const getImageUrl = (article) => {
  const imageUrl = article.featured_image?.url;
  if (imageUrl) {
    // Asegurarnos de que la URL sea absoluta
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Si es una URL relativa, agregar el dominio de la API
    return `https://api.voltajedigital.com${imageUrl}`;
  }
  // URL por defecto absoluta
  return 'https://tocastereo.co/og-image.jpg';
};

// Función para leer y modificar el HTML
const injectMetaTags = (html, metaTags) => {
  // Eliminar el title original y meta tags
  html = html.replace(/<title>.*?<\/title>/, '');
  html = html.replace(/<meta\s+name="description".*?>/g, '');
  html = html.replace(/<meta\s+property="og:.*?".*?>/g, '');
  html = html.replace(/<meta\s+name="twitter:.*?".*?>/g, '');
  
  // Inyectar los nuevos meta tags antes del cierre de </head>
  return html.replace(
    '</head>',
    `${metaTags}\n</head>`
  );
};

// Manejar todas las rutas
app.get('*', async (req, res) => {
  try {
    const indexPath = path.join(distPath, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      console.error('Error: index.html not found at:', indexPath);
      return res.status(404).send('index.html not found');
    }

    let html = fs.readFileSync(indexPath, 'utf-8');

    if (req.path.startsWith('/noticias/')) {
      const slug = req.path.split('/').pop();
      try {
        console.log('Fetching article with slug:', slug);
        const params = new URLSearchParams({
          'filters[slug][$eq]': slug,
          'populate[featured_image][fields][0]': 'url',
          'populate[featured_image][fields][1]': 'formats',
          'populate[author][fields][0]': 'name',
          'populate[author][fields][1]': 'bio',
          'populate[author][fields][2]': 'slug',
          'populate[author][populate][avatar][fields][0]': 'url',
          'populate[categoria][fields][0]': 'name',
          'populate[categoria][fields][1]': 'slug',
          'populate[tags][fields][0]': 'Nombre',
          'populate[tags][fields][1]': 'slug'
        });
        
        const response = await fetch(`https://api.voltajedigital.com/api/noticias?${params}`);
        const data = await response.json();
        
        const article = data.data[0];
        if (article) {
          const imageUrl = getImageUrl(article);
          console.log('Using featured image URL:', imageUrl);

          const metaTags = `
            <!-- Primary Meta Tags -->
            <title>${article.title} | Toca Stereo</title>
            <meta name="title" content="${article.title} | Toca Stereo" />
            <meta name="description" content="${article.excerpt || ''}" />

            <!-- Open Graph / Facebook -->
            <meta property="og:type" content="article" />
            <meta property="og:url" content="https://tocastereo.co${req.path}" />
            <meta property="og:title" content="${article.title}" />
            <meta property="og:description" content="${article.excerpt || ''}" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="Toca Stereo" />
            <meta property="article:published_time" content="${article.published}" />
            <meta property="article:modified_time" content="${article.updated_at || article.published}" />
            <meta property="article:section" content="${article.categoria?.name || 'Noticias'}" />
            <meta property="article:author" content="${article.author?.name || 'Toca Stereo'}" />

            <!-- Twitter -->
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content="https://tocastereo.co${req.path}" />
            <meta name="twitter:title" content="${article.title}" />
            <meta name="twitter:description" content="${article.excerpt || ''}" />
            <meta name="twitter:image" content="${imageUrl}" />
            <meta name="twitter:site" content="@tocastereo" />
            <meta name="twitter:creator" content="@tocastereo" />

            <!-- Schema.org -->
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "headline": "${article.title}",
                "description": "${article.excerpt || ''}",
                "image": {
                  "@type": "ImageObject",
                  "url": "${imageUrl}",
                  "width": "1200",
                  "height": "630"
                },
                "datePublished": "${article.published}",
                "dateModified": "${article.updated_at || article.published}",
                "author": {
                  "@type": "Person",
                  "name": "${article.author?.name || 'Toca Stereo'}"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Toca Stereo",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://tocastereo.co/logo.png"
                  }
                },
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": "https://tocastereo.co${req.path}"
                },
                "articleSection": "${article.categoria?.name || 'Noticias'}",
                "keywords": "${article.tags?.map(tag => tag.Nombre).join(', ') || ''}"
              }
            </script>
          `;
          html = injectMetaTags(html, metaTags);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      }
    }

    res.send(html);
  } catch (error) {
    console.error('Error serving page:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Serving static files from:', distPath);
});
