import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = 'https://api.voltajedigital.com/api/noticias';
const SITE_URL = 'https://tocastereo.co';

const CATEGORIES = {
  tendencias: 'Tendencia',
  entretenimiento: 'Entretenimiento',
  nacional: 'Nacional',
  mundo: 'Mundo',
  deportes: 'Deportes'
};

async function fetchNewsByCategory(category) {
  try {
    const params = new URLSearchParams({
      'filters[categoria][slug][$eq]': category,
      'sort[0]': 'published:desc',
      'populate[featured_image][fields][0]': 'url',
      'populate[categoria][fields][0]': 'name',
      'pagination[limit]': '100' // Ajustar según necesidad
    });

    const response = await axios.get(`${API_URL}?${params}`);
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching ${category} news:`, error.message);
    return [];
  }
}

function generateNewsXML(articles, category) {
  const newsItems = articles.map(article => `
    <url>
      <loc>${SITE_URL}/noticias/${article.slug}</loc>
      <news:news>
        <news:publication>
          <news:name>Toca Stereo</news:name>
          <news:language>es</news:language>
        </news:publication>
        <news:publication_date>${new Date(article.published).toISOString()}</news:publication_date>
        <news:title>${article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
        <news:keywords>${category}</news:keywords>
      </news:news>
      <lastmod>${new Date(article.updatedAt || article.published).toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${newsItems}
</urlset>`;
}

function generateSitemapIndex(sitemaps) {
  const sitemapItems = sitemaps.map(sitemap => `
    <sitemap>
      <loc>${SITE_URL}/sitemaps/${sitemap}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapItems}
</sitemapindex>`;
}

async function generateSitemaps() {
  try {
    const sitemapFiles = [];

    // Generar sitemap para cada categoría
    for (const [slug, name] of Object.entries(CATEGORIES)) {
      const articles = await fetchNewsByCategory(slug);
      if (articles.length > 0) {
        const fileName = `news-${slug}.xml`;
        const xml = generateNewsXML(articles, name);
        await fs.writeFile(join(__dirname, '../public/sitemaps', fileName), xml);
        sitemapFiles.push(fileName);
        console.log(`Generated sitemap for ${name}`);
      }
    }

    // Generar sitemap índice
    const indexXml = generateSitemapIndex(sitemapFiles);
    await fs.writeFile(join(__dirname, '../public/sitemaps/sitemap-news.xml'), indexXml);
    console.log('Generated sitemap index');

  } catch (error) {
    console.error('Error generating sitemaps:', error);
  }
}

// Ejecutar la generación de sitemaps
generateSitemaps();
