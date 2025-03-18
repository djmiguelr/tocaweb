import fs from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import fetch from 'node-fetch';

async function fetchNewsData() {
  try {
    const response = await fetch('https://api.voltajedigital.com/api/noticias?pagination[pageSize]=100');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

async function fetchCategories() {
  try {
    const response = await fetch('https://api.voltajedigital.com/api/categorias');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function generateSitemap() {
  try {
    // Obtener datos dinámicos
    const [news, categories] = await Promise.all([
      fetchNewsData(),
      fetchCategories()
    ]);

    // Rutas estáticas principales
    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/noticias', changefreq: 'hourly', priority: 0.9 },
      { url: '/toca-exitos', changefreq: 'daily', priority: 0.8 },
      { url: '/entrevistas', changefreq: 'daily', priority: 0.8 },
      { url: '/programacion', changefreq: 'monthly', priority: 0.7 },
      { url: '/radio-en-vivo', changefreq: 'always', priority: 1.0 },
      { url: '/contacto', changefreq: 'monthly', priority: 0.5 },
    ];

    // Rutas de noticias
    const newsRoutes = news.map(item => ({
      url: `/noticias/${item.slug}`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: item.updated_at || item.published,
      img: item.featured_image?.url ? [
        {
          url: item.featured_image.url,
          caption: item.title,
          title: item.title
        }
      ] : undefined
    }));

    // Rutas de categorías
    const categoryRoutes = categories.map(category => ({
      url: `/categoria/${category.slug}`,
      changefreq: 'daily',
      priority: 0.7
    }));

    // Crear stream del sitemap
    const stream = new SitemapStream({
      hostname: 'https://tocastereo.co',
      xmlns: {
        news: true,
        xhtml: true,
        image: true,
        video: true
      }
    });

    // Generar sitemap XML combinando todas las rutas
    const sitemap = await streamToPromise(
      Readable.from([...staticRoutes, ...newsRoutes, ...categoryRoutes]).pipe(stream)
    );
    
    // Asegurar que el directorio public existe
    if (!fs.existsSync('./public')) {
      fs.mkdirSync('./public', { recursive: true });
    }
    
    // Escribir el sitemap
    fs.writeFileSync('./public/sitemap.xml', sitemap.toString());
    console.log('¡Sitemap generado exitosamente!');

    // Generar robots.txt
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

# Sitemap
Sitemap: https://tocastereo.co/sitemap.xml

# Crawl-delay
Crawl-delay: 10`;

    fs.writeFileSync('./public/robots.txt', robotsTxt);
    console.log('¡Robots.txt generado exitosamente!');

  } catch (error) {
    console.error('Error generando sitemap:', error);
  }
}

generateSitemap();
