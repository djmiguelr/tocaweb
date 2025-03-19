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

// Función para leer y modificar el HTML
const injectMetaTags = (html, metaTags) => {
  // Eliminar el title original
  html = html.replace(/<title>.*?<\/title>/, '');
  
  // Eliminar meta tags originales de SEO
  html = html.replace(/<meta\s+name="description".*?>/g, '');
  html = html.replace(/<meta\s+property="og:.*?".*?>/g, '');
  html = html.replace(/<meta\s+name="twitter:.*?".*?>/g, '');
  
  // Inyectar los nuevos meta tags
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
        const response = await fetch(`https://api.voltajedigital.com/api/noticias?filters[slug]=${slug}`);
        const data = await response.json();
        const article = data.data[0];

        if (article) {
          // Asegurarnos de que tenemos la URL completa de la imagen
          const imageUrl = article.featured_image?.url 
            ? article.featured_image.url.startsWith('http') 
              ? article.featured_image.url 
              : `https://api.voltajedigital.com${article.featured_image.url}`
            : 'https://tocastereo.co/og-image.jpg';

          const metaTags = `
            <title>${article.title} | Toca Stereo</title>
            <meta name="description" content="${article.excerpt || ''}" />
            <meta property="og:title" content="${article.title}" />
            <meta property="og:description" content="${article.excerpt || ''}" />
            <meta property="og:type" content="article" />
            <meta property="og:url" content="https://tocastereo.co${req.path}" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:site_name" content="Toca Stereo" />
            <meta property="article:published_time" content="${article.published}" />
            <meta property="article:modified_time" content="${article.updated_at || article.published}" />
            <meta property="article:section" content="${article.categoria?.name || 'Noticias'}" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${article.title}" />
            <meta name="twitter:description" content="${article.excerpt || ''}" />
            <meta name="twitter:image" content="${imageUrl}" />
            <meta name="twitter:site" content="@tocastereo" />
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "headline": "${article.title}",
                "description": "${article.excerpt || ''}",
                "image": "${imageUrl}",
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
                "keywords": "${article.tags?.map(tag => tag.name).join(', ') || ''}"
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
