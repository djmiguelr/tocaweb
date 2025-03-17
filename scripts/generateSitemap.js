const fs = require('fs');
const axios = require('axios');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

const API_URL = 'https://api.voltajedigital.com/api';

async function fetchAllUrls() {
  try {
    // Fetch all news
    const newsResponse = await axios.get(`${API_URL}/noticias`);
    const news = newsResponse.data;

    // Fetch all categories
    const categoriesResponse = await axios.get(`${API_URL}/categorias`);
    const categories = categoriesResponse.data;

    // Fetch all tags
    const tagsResponse = await axios.get(`${API_URL}/tags`);
    const tags = tagsResponse.data;

    // Fetch all authors
    const authorsResponse = await axios.get(`${API_URL}/autores`);
    const authors = authorsResponse.data;

    // Define static routes
    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/noticias', changefreq: 'hourly', priority: 0.9 },
      { url: '/radio', changefreq: 'monthly', priority: 0.8 },
      { url: '/contacto', changefreq: 'monthly', priority: 0.5 },
    ];

    // Add dynamic news routes
    const newsRoutes = news.map(item => ({
      url: `/noticias/${item.slug}`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: item.updated_at || item.published
    }));

    // Add category routes
    const categoryRoutes = categories.map(category => ({
      url: `/categoria/${category.slug}`,
      changefreq: 'daily',
      priority: 0.7
    }));

    // Add tag routes
    const tagRoutes = tags.map(tag => ({
      url: `/tag/${tag.slug}`,
      changefreq: 'weekly',
      priority: 0.6
    }));

    // Add author routes
    const authorRoutes = authors.map(author => ({
      url: `/autor/${author.slug}`,
      changefreq: 'weekly',
      priority: 0.6
    }));

    // Combine all routes
    return [
      ...staticRoutes,
      ...newsRoutes,
      ...categoryRoutes,
      ...tagRoutes,
      ...authorRoutes
    ];
  } catch (error) {
    console.error('Error fetching URLs:', error);
    return [];
  }
}

async function generateSitemap() {
  try {
    const urls = await fetchAllUrls();

    // Create a sitemap stream
    const stream = new SitemapStream({
      hostname: 'https://tocastereo.co',
      xmlns: {
        news: true,
        xhtml: true,
        image: true,
        video: true
      }
    });

    // Add URLs to the stream
    urls.forEach(url => stream.write(url));
    stream.end();

    // Generate sitemap XML
    const sitemap = await streamToPromise(Readable.from(urls).pipe(stream));
    fs.writeFileSync('./public/sitemap.xml', sitemap.toString());

    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap();
