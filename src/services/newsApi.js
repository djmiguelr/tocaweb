import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.TOKEN}`
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    console.log('[API Request Headers]', config.headers);
    console.log('[API Request Params]', config.params);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] Status: ${response.status}`);
    console.log('[API Response Data]', response.data);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      }
    });
    return Promise.reject(error);
  }
);

const transformNewsData = (newsData) => {
  if (!newsData) {
    console.error('transformNewsData: newsData is null or undefined');
    return null;
  }

  try {
    const data = newsData.attributes || newsData;
    return {
      id: newsData.id,
      documentId: data.documentId,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      image_source: data.image_source,
      published: data.published,
      content: data.content,
      featured_image: data.featured_image?.data?.attributes || data.featured_image,
      author: data.author?.data?.attributes || data.author,
      categoria: data.categoria?.data?.attributes || data.categoria,
      tags: (data.tags?.data || data.tags || []).map(tag => ({
        id: tag.id,
        name: tag.attributes?.Nombre || tag.Nombre,
        slug: tag.attributes?.slug || tag.slug
      }))
    };
  } catch (error) {
    console.error('Error transforming news data:', error, newsData);
    throw new Error('Error transformando los datos de la noticia');
  }
};

export const getAllNews = async () => {
  try {
    const response = await api.get('/noticias', {
      params: {
        populate: '*',
        'sort[0]': 'published:desc'
      }
    });
    
    if (!response?.data?.data) {
      throw new Error('Formato de respuesta inválido');
    }
    
    return {
      data: response.data.data.map(transformNewsData),
      meta: response.data.meta
    };
  } catch (error) {
    console.error('[getAllNews] Error:', error);
    throw error;
  }
};

export const getNewsBySlug = async (slug) => {
  try {
    console.log('[getNewsBySlug] Fetching news with slug:', slug);
    
    const response = await api.get('/noticias', {
      params: {
        'filters[slug][$eq]': slug,
        'populate[featured_image][fields][0]': 'url',
        'populate[author][fields][0]': 'name',
        'populate[author][fields][1]': 'bio',
        'populate[author][fields][2]': 'slug',
        'populate[author][populate][avatar][fields][0]': 'url',
        'populate[categoria][fields][0]': 'name',
        'populate[categoria][fields][1]': 'slug',
        'populate[tags][fields][0]': 'Nombre',
        'populate[tags][fields][1]': 'slug'
      }
    });

    console.log('[getNewsBySlug] Raw response:', JSON.stringify(response.data, null, 2));

    if (!response?.data?.data?.[0]) {
      console.log('[getNewsBySlug] No news found');
      return null;
    }

    const item = response.data.data[0];
    console.log('[getNewsBySlug] Processing item:', item);

    // Procesar los tags
    const tags = item.tags?.map(tag => ({
      id: tag.id,
      Nombre: tag.Nombre,
      slug: tag.slug
    })) || [];

    console.log('[getNewsBySlug] Processed tags:', tags);

    return {
      id: item.id,
      documentId: item.documentId || '',
      title: item.title || '',
      slug: item.slug || '',
      excerpt: item.excerpt || '',
      image_source: item.image_source || '',
      published: item.published || '',
      content: item.content || '',
      featured_image: item.featured_image || null,
      author: item.author || null,
      categoria: item.categoria || null,
      tags
    };
  } catch (error) {
    console.error('[getNewsBySlug] Error:', error);
    throw error;
  }
};

export const getNewsByCategory = async (categorySlug, page = 1) => {
  try {
    const response = await api.get('/noticias', {
      params: {
        'filters[categoria][slug][$eq]': categorySlug,
        'populate': '*',
        'sort': ['published:desc'],
        'pagination[page]': page,
        'pagination[pageSize]': 12
      }
    });

    if (!response.data || !response.data.data) {
      throw new Error('No se pudieron cargar las noticias de esta categoría');
    }

    const transformedData = response.data.data.map(newsItem => ({
      id: newsItem.documentId,
      title: newsItem.title,
      slug: newsItem.slug,
      excerpt: newsItem.excerpt,
      image_source: newsItem.image_source,
      published: newsItem.published,
      content: newsItem.content,
      featured_image: newsItem.featured_image,
      author: newsItem.author,
      categoria: newsItem.categoria,
      tags: newsItem.tags
    }));

    return {
      data: transformedData,
      meta: response.data.meta
    };
  } catch (error) {
    console.error('[getNewsByCategory] Error:', error);
    throw error;
  }
};

export const getNewsByTag = async (slug) => {
  try {
    console.log('[getNewsByTag] Fetching news for tag:', slug);
    
    const response = await api.get('/noticias', {
      params: {
        'filters[tags][slug][$eq]': slug,
        'populate[featured_image][fields][0]': 'url',
        'populate[author][fields][0]': 'name',
        'populate[author][fields][1]': 'bio',
        'populate[author][fields][2]': 'slug',
        'populate[author][populate][avatar][fields][0]': 'url',
        'populate[categoria][fields][0]': 'name',
        'populate[categoria][fields][1]': 'slug',
        'populate[tags][fields][0]': 'Nombre',
        'populate[tags][fields][1]': 'slug',
        'sort[0]': 'published:desc'
      }
    });

    console.log('[getNewsByTag] Raw response:', JSON.stringify(response.data, null, 2));

    if (!response?.data?.data) {
      console.log('[getNewsByTag] No news found');
      return { data: [] };
    }

    const processedNews = response.data.data.map(item => {
      if (!item) {
        console.warn('[getNewsByTag] Invalid item:', item);
        return null;
      }

      // Los datos están directamente en el item
      return {
        id: item.id,
        documentId: item.documentId || '',
        title: item.title || '',
        slug: item.slug || '',
        excerpt: item.excerpt || '',
        image_source: item.image_source || '',
        published: item.published || '',
        content: item.content || '',
        featured_image: item.featured_image || null,
        author: item.author || null,
        categoria: item.categoria || null,
        tags: item.tags?.map(tag => ({
          id: tag.id,
          Nombre: tag.Nombre,
          slug: tag.slug
        })) || []
      };
    }).filter(item => {
      if (!item) return false;
      
      // Verificar que tenga los campos requeridos
      const hasRequiredFields = 
        item.documentId && 
        item.title && 
        item.slug && 
        item.excerpt && 
        item.published && 
        item.content;

      if (!hasRequiredFields) {
        console.warn('[getNewsByTag] Item missing required fields:', item);
        return false;
      }

      return true;
    });

    console.log('[getNewsByTag] Processed news:', processedNews);
    return { data: processedNews };
  } catch (error) {
    console.error('[getNewsByTag] Error:', error);
    throw error;
  }
};

export const getNewsByAuthor = async (authorSlug) => {
  try {
    const response = await api.get('/noticias', {
      params: {
        'filters[author][slug][$eq]': authorSlug,
        'populate': '*',
        'sort[0]': 'published:desc'
      }
    });

    if (!response?.data?.data) {
      return [];
    }

    return response.data.data.map(transformNewsData);
  } catch (error) {
    console.error('[getNewsByAuthor] Error:', error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    console.log('[getAllCategories] Fetching all categories');
    
    const response = await api.get('/categorias', {
      params: {
        'fields[0]': 'name',
        'fields[1]': 'slug'
      }
    });

    console.log('[getAllCategories] Raw response:', response.data);

    if (!response?.data?.data) {
      console.log('[getAllCategories] No categories found');
      return [];
    }

    const categories = response.data.data.map(category => ({
      id: category.id,
      name: category.name || '',
      slug: category.slug || ''
    }));

    console.log('[getAllCategories] Processed categories:', categories);
    return categories;
  } catch (error) {
    console.error('[getAllCategories] Error:', error);
    throw error;
  }
};

export const getNewsByCategories = async () => {
  try {
    console.log('[getNewsByCategories] Fetching news by categories');
    
    // Primero obtenemos todas las categorías
    const categories = await getAllCategories();
    
    // Luego obtenemos las noticias para cada categoría
    const newsByCategory = await Promise.all(
      categories.map(async (category) => {
        const response = await api.get('/noticias', {
          params: {
            'filters[categoria][id][$eq]': category.id,
            'populate[featured_image][fields][0]': 'url',
            'populate[author][fields][0]': 'name',
            'populate[author][fields][1]': 'slug',
            'populate[author][populate][avatar][fields][0]': 'url',
            'populate[categoria][fields][0]': 'name',
            'populate[categoria][fields][1]': 'slug',
            'sort[0]': 'published:desc'
          }
        });

        if (!response?.data?.data) return null;

        const news = response.data.data.map(item => ({
          id: item.id,
          documentId: item.documentId || '',
          title: item.title || '',
          slug: item.slug || '',
          excerpt: item.excerpt || '',
          image_source: item.image_source || '',
          published: item.published || '',
          featured_image: item.featured_image || null,
          author: item.author || null,
          categoria: item.categoria || null
        }));

        return {
          category,
          news
        };
      })
    );

    // Filtramos las categorías sin noticias
    return newsByCategory.filter(item => item && item.news.length > 0);
  } catch (error) {
    console.error('[getNewsByCategories] Error:', error);
    throw error;
  }
};

export const getAllAuthors = async () => {
  try {
    console.log('[getAllAuthors] Fetching all authors');
    const response = await api.get('/authors', {
      params: {
        fields: 'name,bio,slug',
        'populate[avatar][fields]': 'url',
        'populate[noticias][fields]': 'title,excerpt,slug'
      }
    });

    console.log('[getAllAuthors] Raw response:', response.data);

    if (!response?.data?.data) {
      console.log('[getAllAuthors] No authors found');
      return [];
    }

    const authors = response.data.data.map(author => ({
      id: author.id,
      name: author.name || '',
      bio: author.bio || '',
      slug: author.slug || '',
      avatar: author.avatar || null,
      news: author.noticias || []
    }));

    console.log('[getAllAuthors] Processed authors:', authors);
    return authors;
  } catch (error) {
    console.error('[getAllAuthors] Error:', error);
    throw error;
  }
};

export const getAuthorBySlug = async (slug) => {
  try {
    console.log('[getAuthorBySlug] Fetching author with slug:', slug);
    const response = await api.get('/authors', {
      params: {
        'filters[slug][$eq]': slug,
        fields: 'name,bio,slug',
        'populate[avatar][fields]': 'url',
        'populate[noticias][fields]': 'title,excerpt,slug'
      }
    });

    console.log('[getAuthorBySlug] Raw response:', response.data);

    if (!response?.data?.data?.[0]) {
      console.log('[getAuthorBySlug] No author found with slug:', slug);
      return null;
    }

    const author = response.data.data[0];
    const processedAuthor = {
      id: author.id,
      name: author.name || '',
      bio: author.bio || '',
      slug: author.slug || '',
      avatar: author.avatar || null,
      news: author.noticias || []
    };

    console.log('[getAuthorBySlug] Processed author:', processedAuthor);
    return processedAuthor;
  } catch (error) {
    console.error('[getAuthorBySlug] Error:', error);
    throw error;
  }
};

export const getAllTags = async () => {
  try {
    const response = await api.get('/tags', {
      params: {
        'fields[0]': 'name',
        'fields[1]': 'slug'
      }
    });
    return response.data;
  } catch (error) {
    console.error('[getAllTags] Error:', error);
    throw error;
  }
};

export const searchNews = async (query) => {
  try {
    console.log('[searchNews] Searching news with query:', query);
    const response = await api.get('/noticias', {
      params: {
        'filters[$or][0][title][$containsi]': query,
        'filters[$or][1][excerpt][$containsi]': query,
        'filters[$or][2][content][$containsi]': query,
        'populate[featured_image][fields]': 'url',
        'populate[author][fields]': 'name,slug',
        'populate[author][populate][avatar][fields]': 'url',
        'populate[categoria][fields]': 'name,slug',
        'sort[0]': 'published:desc'
      }
    });

    if (!response?.data?.data) {
      console.log('[searchNews] No results found');
      return [];
    }

    const news = response.data.data.map(item => ({
      id: item.id,
      documentId: item.documentId || '',
      title: item.title || '',
      slug: item.slug || '',
      excerpt: item.excerpt || '',
      image_source: item.image_source || '',
      published: item.published || '',
      featured_image: item.featured_image || null,
      author: item.author || null,
      categoria: item.categoria || null
    }));

    console.log('[searchNews] Found results:', news.length);
    return news;
  } catch (error) {
    console.error('[searchNews] Error:', error);
    throw error;
  }
};

export const getLatestNews = async () => {
  try {
    console.log('[getLatestNews] Fetching latest news');
    const response = await api.get('/noticias', {
      params: {
        'sort[0]': 'published:desc',
        'populate[featured_image][fields]': 'url',
        'populate[author][fields]': 'name,slug',
        'populate[author][populate][avatar][fields]': 'url',
        'populate[categoria][fields]': 'name,slug',
        'pagination[pageSize]': 4,
        'pagination[page]': 1
      }
    });

    if (!response?.data?.data) {
      console.log('[getLatestNews] No news found');
      return [];
    }

    const news = response.data.data.map(item => ({
      id: item.id,
      documentId: item.documentId || '',
      title: item.title || '',
      slug: item.slug || '',
      excerpt: item.excerpt || '',
      image_source: item.image_source || '',
      published: item.published || '',
      featured_image: item.featured_image || null,
      author: item.author || null,
      categoria: item.categoria || null
    }));

    console.log('[getLatestNews] Found news:', news.length);
    return news;
  } catch (error) {
    console.error('[getLatestNews] Error:', error);
    throw error;
  }
};

// Obtener detalles de una categoría y sus noticias
export const getCategoryDetail = async (slug, page = 1) => {
  try {
    const response = await api.get(`/categorias`, {
      params: {
        'filters[slug][$eq]': slug,
        'populate[news]': {
          'populate': ['featured_image', 'author', 'categoria', 'tags'],
          'sort': ['published:desc'],
          'pagination[page]': page,
          'pagination[pageSize]': 12
        }
      }
    });

    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      throw new Error('Categoría no encontrada');
    }

    const category = response.data[0];
    const newsResponse = await api.get('/noticias', {
      params: {
        'filters[categoria][slug][$eq]': slug,
        'populate': ['featured_image', 'author', 'categoria', 'tags'],
        'sort': ['published:desc'],
        'pagination[page]': page,
        'pagination[pageSize]': 12
      }
    });

    return {
      data: {
        ...category,
        news: newsResponse.data.map(transformNewsData)
      },
      meta: newsResponse.meta
    };
  } catch (error) {
    console.error('[getCategoryDetail] Error:', error);
    throw error;
  }
};
