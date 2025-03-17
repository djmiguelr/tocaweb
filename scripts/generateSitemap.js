import fs from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

async function generateSitemap() {
  try {
    // Define static routes
    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/noticias', changefreq: 'hourly', priority: 0.9 },
      { url: '/toca-exitos', changefreq: 'daily', priority: 0.8 },
      { url: '/entrevistas', changefreq: 'daily', priority: 0.8 },
      { url: '/programacion', changefreq: 'monthly', priority: 0.7 },
    ];

    // Create a sitemap stream
    const stream = new SitemapStream({
      hostname: 'https://tocastereo.co'
    });

    // Generate sitemap XML
    const sitemap = await streamToPromise(
      Readable.from(staticRoutes).pipe(stream)
    );
    
    // Asegurar que el directorio public existe
    if (!fs.existsSync('./public')) {
      fs.mkdirSync('./public', { recursive: true });
    }
    
    fs.writeFileSync('./public/sitemap.xml', sitemap.toString());
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap();
