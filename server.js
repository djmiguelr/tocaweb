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

// Servir archivos estáticos
app.use(express.static('dist'));

// Función para leer y modificar el HTML
const injectMetaTags = (html, metaTags) => {
  return html.replace(
    '</head>',
    `${metaTags}\n</head>`
  );
};

// Manejar todas las rutas
app.get('*', async (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf-8');

    // Aquí es donde inyectaríamos las meta tags según la ruta
    // Por ejemplo, para rutas de noticias:
    if (req.path.startsWith('/noticias/')) {
      const slug = req.path.split('/').pop();
      try {
        const response = await fetch(`https://api.voltajedigital.com/api/noticias?filters[slug]=${slug}`);
        const data = await response.json();
        const article = data.data[0];

        if (article) {
          const metaTags = `
            <title>${article.title} | Toca Stereo</title>
            <meta name="description" content="${article.excerpt}" />
            <meta property="og:title" content="${article.title}" />
            <meta property="og:description" content="${article.excerpt}" />
            <meta property="og:type" content="article" />
            <meta property="og:url" content="https://tocastereo.co${req.path}" />
            <meta property="og:image" content="${article.featured_image?.url}" />
            <meta property="og:site_name" content="Toca Stereo" />
            <meta property="article:published_time" content="${article.published}" />
            <meta property="article:modified_time" content="${article.updated_at || article.published}" />
            <meta property="article:section" content="${article.categoria?.name}" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${article.title}" />
            <meta name="twitter:description" content="${article.excerpt}" />
            <meta name="twitter:image" content="${article.featured_image?.url}" />
            <meta name="twitter:site" content="@tocastereo" />
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "headline": "${article.title}",
                "description": "${article.excerpt}",
                "image": "${article.featured_image?.url}",
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
                }
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
});
