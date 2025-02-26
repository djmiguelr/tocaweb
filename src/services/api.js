import axios from 'axios';

// Constantes de API
const API_URL = 'https://api.voltajedigital.com';
const API_BASE = `${API_URL}/api`;

// IDs de las ciudades
const CITY_IDS = {
  ZONA_CENTRO: 'hn1wfkshhnhqf60ffwtizwor',
  BOYACA: 'kejsttdeoff6hitw9q2souox',
  TOLIMA: 'plqh7qhqz1bsrbolxc6vfvhf'
};

// Constantes útiles
const constants = {
  API_URL,
  API_BASE,
  CITY_IDS
};

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Función helper para procesar URLs
const getMediaUrl = (media) => {
  if (!media?.url || typeof media.url !== 'string') {
    return null;
  }
  // Si la URL ya es absoluta, la retornamos tal cual
  if (media.url.startsWith('http')) {
    return media.url;
  }
  // Si no, la concatenamos con la URL base
  return `${API_URL}${media.url}`;
};

// Función helper para procesar TocaExitos
const processTocaExitos = (tocaExitos) => {
  if (!Array.isArray(tocaExitos)) return [];

  return tocaExitos.map(item => {
    // Asegurarnos de que las URLs sean correctas
    const songUrl = item.song?.url ? getMediaUrl(item.song) : null;
    const coverUrl = item.cover?.url ? getMediaUrl(item.cover) : null;

    return {
      id: item.id,
      title: item.title || '',
      artist: item.artist || '',
      rank: item.rank || 0,
      cover: coverUrl ? {
        url: coverUrl,
        documentId: item.cover.documentId
      } : null,
      song: songUrl ? {
        url: songUrl,
        documentId: item.song.documentId
      } : null
    };
  });
};

// Función helper para procesar datos de ciudad
const processCityData = (cityData) => {
  // Función helper para procesar URLs de stream
  const processStreamUrl = (url) => {
    if (!url) return null;
    
    // Si ya es una URL completa, la retornamos
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si empieza con //, añadimos https:
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    
    // En cualquier otro caso, añadimos https://
    return `https://${url}`;
  };

  return {
    id: cityData.id,
    documentId: cityData.documentId,
    name: cityData.name,
    frequency: cityData.frequency,
    stream_url: processStreamUrl(cityData.stream_url),
    apps: cityData.apps?.[0] ? {
      android: cityData.apps[0].android,
      ios: cityData.apps[0].ios
    } : null,
    Redes: Array.isArray(cityData.Redes) ? cityData.Redes.map(red => ({
      id: red.id,
      plataforma: red.plataforma,
      URL: red.URL
    })) : [],
    TocaExitos: processTocaExitos(cityData.TocaExitos)
  };
};

// Función helper para procesar noticias
const processNewsData = (newsData) => {
  if (!Array.isArray(newsData)) {
    console.warn('processNewsData: Se esperaba un array, se recibió:', typeof newsData);
    return [];
  }

  return newsData.map(item => {
    try {
      // Manejar tanto el formato con attributes como el formato directo
      const isAttributesFormat = !!item?.attributes;
      const data = isAttributesFormat ? item.attributes : item;

      // Validar campos requeridos
      if (!data.title || !data.slug) {
        console.warn('processNewsData: Noticia sin título o slug:', data);
        return null;
      }

      // Procesar la imagen según el formato
      let imagen = null;
      if (isAttributesFormat && data.Imagendestacada?.data) {
        imagen = {
          url: `${API_URL}${data.Imagendestacada.data.attributes.url}`,
          documentId: data.Imagendestacada.data.id
        };
      } else if (data.Imagendestacada) {
        imagen = {
          url: `${API_URL}${data.Imagendestacada.url}`,
          documentId: data.Imagendestacada.documentId
        };
      }

      return {
        id: item.id,
        documentId: item.documentId || item.id,
        title: data.title,
        categoria: data.categoria || 'Sin categoría',
        contenido: data.contenido || '',
        fechaPublicacion: data.Fechapublicacion || null,
        slug: data.slug,
        imagen
      };
    } catch (error) {
      console.error('Error procesando noticia:', error, item);
      return null;
    }
  }).filter(Boolean); // Eliminar elementos null
};

// Función helper para procesar sliders
const processSliderData = (sliderData) => {
  if (!Array.isArray(sliderData)) return [];
  
  return sliderData.map(item => ({
    id: item.id,
    documentId: item.documentId,
    title: item.title || '',
    URLslider: item.URLslider || '#',
    horario: {
      inicio: item.HoraInicio || null,
      fin: item.HoraFin || null,
      dias: Array.isArray(item.dias) ? item.dias : []
    },
    imagen: item.imagen ? {
      url: getMediaUrl(item.imagen),
      documentId: item.imagen.documentId
    } : null,
    imgrespon: item.imgrespon ? {
      url: getMediaUrl(item.imgrespon),
      documentId: item.imgrespon.documentId
    } : null
  }));
};

// Añadir a las funciones helper existentes
const processHeaderData = (headerData) => {
  if (!headerData) return null;
  
  return {
    title: headerData.Titulo || '',
    description: headerData.descripcion || '',
    logo: headerData.logoprincipal ? {
      url: getMediaUrl(headerData.logoprincipal),
      documentId: headerData.logoprincipal.documentId
    } : null,
    cover: headerData.coverprincipal ? {
      url: getMediaUrl(headerData.coverprincipal),
      documentId: headerData.coverprincipal.documentId
    } : null
  };
};

// Función helper para procesar entrevistas
const processEntrevistasData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    id: item.id,
    documentId: item.documentId,
    youtubeId: item.urlyoutube,
    title: item.titulo,
    description: item.description,
    slug: item.slugentre,
    portada: item.portada ? {
      url: `${API_URL}${item.portada.url}`,
      documentId: item.portada.documentId
    } : null
  }));
};

// Servicio API
const apiService = {
  async getCity(cityId) {
    try {
      const response = await api.get('/ciudades', {
        params: {
          'filters[documentId][$eq]': cityId,
          'populate[TocaExitos][fields][0]': 'title',
          'populate[TocaExitos][fields][1]': 'artist',
          'populate[TocaExitos][fields][2]': 'rank',
          'populate[TocaExitos][populate][cover][fields]': 'url',
          'populate[TocaExitos][populate][song][fields]': 'url',
          'populate[apps][fields][0]': 'android',
          'populate[apps][fields][1]': 'ios',
          'populate[Redes][fields][0]': 'plataforma',
          'populate[Redes][fields][1]': 'URL'
        }
      });

      if (!response.data?.data?.[0]) {
        throw new Error('Ciudad no encontrada');
      }

      return processCityData(response.data.data[0]);
    } catch (error) {
      console.error(`Error al obtener ciudad ${cityId}:`, error);
      throw error;
    }
  },

  async getDefaultCities() {
    try {
      const results = await Promise.allSettled([
        this.getCity(CITY_IDS.ZONA_CENTRO),
        this.getCity(CITY_IDS.BOYACA),
        this.getCity(CITY_IDS.TOLIMA)
      ]);

      // Filtrar solo las ciudades que se resolvieron correctamente
      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      console.error('Error al obtener ciudades predefinidas:', error);
      throw error;
    }
  },

  async getSliders() {
    try {
      const response = await api.get('/sliders', { 
        params: { 
          'populate[fields][0]': 'title',
          'populate[fields][1]': 'URLslider',
          'populate[fields][2]': 'HoraInicio',
          'populate[fields][3]': 'HoraFin',
          'populate[fields][4]': 'dias',
          'populate[imagen][fields]': 'url',
          'populate[imgrespon][fields]': 'url'
        } 
      });

      // Asegurarnos de que tenemos datos válidos
      const sliders = response.data?.data || [];
      
      // Procesar los sliders
      return processSliderData(sliders);
    } catch (error) {
      console.error('Error al obtener sliders:', error);
      return [];
    }
  },

  async getNews() {
    try {
      const response = await api.get('/noticias', {
        params: {
          'populate[Imagendestacada][fields]': 'url',
          'populate[fields][0]': 'title',
          'populate[fields][1]': 'categoria',
          'populate[fields][2]': 'contenido',
          'populate[fields][3]': 'Fechapublicacion',
          'populate[fields][4]': 'slug',
          'sort[0]': 'Fechapublicacion:desc'
        }
      });

      console.log('API News Response Raw:', response.data);

      if (!response.data?.data) {
        console.warn('getNews: Respuesta sin datos:', response.data);
        return [];
      }

      const processedNews = processNewsData(response.data.data);
      console.log('Noticias procesadas:', processedNews);

      return processedNews;
    } catch (error) {
      console.error('Error al obtener noticias:', error.response || error);
      throw new Error('Error al cargar las noticias');
    }
  },

  async getNewsByCategory(categoria) {
    try {
      const response = await api.get('/noticias', {
        params: {
          'filters[categoria][$eq]': categoria,
          'populate[Imagendestacada][fields]': 'url',
          'populate[fields][0]': 'title',
          'populate[fields][1]': 'categoria',
          'populate[fields][2]': 'contenido',
          'populate[fields][3]': 'Fechapublicacion',
          'populate[fields][4]': 'slug',
          'sort[0]': 'Fechapublicacion:desc'
        }
      });

      console.log(`API News Response (${categoria}):`, response.data);

      if (!response.data?.data) {
        console.warn(`getNewsByCategory: Sin datos para ${categoria}:`, response.data);
        return [];
      }

      const processedNews = processNewsData(response.data.data);
      console.log(`Noticias procesadas (${categoria}):`, processedNews);

      return processedNews;
    } catch (error) {
      console.error(`Error al obtener noticias de ${categoria}:`, error.response || error);
      throw new Error(`Error al cargar las noticias de ${categoria}`);
    }
  },

  async getNewsBySlug(slug) {
    try {
      const response = await api.get('/noticias', {
        params: {
          'filters[slug][$eq]': slug,
          'populate[Imagendestacada][fields]': 'url',
          'populate[fields][0]': 'title',
          'populate[fields][1]': 'categoria',
          'populate[fields][2]': 'contenido',
          'populate[fields][3]': 'Fechapublicacion',
          'populate[fields][4]': 'slug'
        }
      });

      console.log(`API News Detail Response (${slug}):`, response.data);

      if (!response.data?.data?.[0]) {
        console.warn(`getNewsBySlug: Noticia no encontrada (${slug})`);
        return null;
      }

      const processedNews = processNewsData([response.data.data[0]]);
      return processedNews[0] || null;
    } catch (error) {
      console.error(`Error al obtener noticia ${slug}:`, error.response || error);
      throw new Error('Error al cargar la noticia');
    }
  },

  async getHeaderInfo() {
    try {
      const response = await api.get('/header', {
        params: {
          'populate[fields][0]': 'Titulo',
          'populate[fields][1]': 'descripcion',
          'populate[logoprincipal][fields]': 'url',
          'populate[coverprincipal][fields]': 'url'
        }
      });

      if (!response.data?.data) {
        return null;
      }

      return processHeaderData(response.data.data);
    } catch (error) {
      console.error('Error al obtener información del header:', error);
      return null;
    }
  },

  async getEntrevistas() {
    try {
      const response = await api.get('/toca-entrevistas', {
        params: {
          'populate[portada][fields]': 'url',
          'fields[0]': 'urlyoutube',
          'fields[1]': 'titulo',
          'fields[2]': 'description',
          'fields[3]': 'slugentre'
        }
      });

      console.log('API Entrevistas Response:', response.data);

      if (!response.data?.data) {
        console.warn('getEntrevistas: Respuesta sin datos');
      return [];
      }

      const processedData = processEntrevistasData(response.data.data);
      console.log('Entrevistas procesadas:', processedData);
      return processedData;
    } catch (error) {
      console.error('Error al obtener entrevistas:', error);
      throw new Error('Error al cargar las entrevistas');
    }
  },

  async getEntrevistaBySlug(slug) {
    if (!slug) {
      console.error('getEntrevistaBySlug: Slug no proporcionado');
      throw new Error('Slug no válido');
    }

    try {
      const response = await api.get('/toca-entrevistas', {
        params: {
          'filters[slugentre][$eq]': slug,
          'populate[portada][fields]': 'url',
          'fields[0]': 'urlyoutube',
          'fields[1]': 'titulo',
          'fields[2]': 'description',
          'fields[3]': 'slugentre'
        }
      });

      console.log(`API Entrevista Detail Response (${slug}):`, response.data);

      if (!response.data?.data?.[0]) {
        console.warn(`getEntrevistaBySlug: Entrevista no encontrada (${slug})`);
        return null;
      }

      const processedData = processEntrevistasData([response.data.data[0]]);
      return processedData[0] || null;
    } catch (error) {
      console.error(`Error al obtener entrevista ${slug}:`, error);
      throw new Error('Error al cargar la entrevista');
    }
  }
};

// Exportaciones
export {
  API_URL as BASE_URL,  // Para compatibilidad con código existente
  apiService,
  constants
};

export default apiService;