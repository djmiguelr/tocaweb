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
  if (!media) return null;
  
  // Si media es un string, asumimos que es la URL directamente
  if (typeof media === 'string') {
    return media.startsWith('http') ? media : `${API_URL}${media}`;
  }
  
  // Si no tiene URL o no es string, retornamos null
  if (!media.url || typeof media.url !== 'string') {
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

  return tocaExitos
    .filter(item => item && item.title && item.artist)
    .map(item => ({
      id: item.id,
      documentId: item.documentId || item.id,
      title: item.title,
      artist: item.artist,
      rank: item.rank || 0,
      cover: item.cover ? {
        url: getMediaUrl(item.cover),
        documentId: item.cover.documentId
      } : null,
      audio: item.song ? {
        url: getMediaUrl(item.song),
        documentId: item.song.documentId
      } : null
    }))
    .sort((a, b) => (a.rank || 0) - (b.rank || 0));
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
    coverlog: cityData.coverlog ? {
      id: cityData.coverlog.id,
      documentId: cityData.coverlog.documentId,
      name: cityData.coverlog.name,
      width: cityData.coverlog.width,
      height: cityData.coverlog.height,
      url: getMediaUrl(cityData.coverlog.url),
      formats: {
        thumbnail: cityData.coverlog.formats?.thumbnail ? {
          ...cityData.coverlog.formats.thumbnail,
          url: getMediaUrl(cityData.coverlog.formats.thumbnail.url)
        } : null,
        small: cityData.coverlog.formats?.small ? {
          ...cityData.coverlog.formats.small,
          url: getMediaUrl(cityData.coverlog.formats.small.url)
        } : null,
        medium: cityData.coverlog.formats?.medium ? {
          ...cityData.coverlog.formats.medium,
          url: getMediaUrl(cityData.coverlog.formats.medium.url)
        } : null
      }
    } : null,
    apps: cityData.apps?.[0] ? {
      android: cityData.apps[0].android,
      ios: cityData.apps[0].ios
    } : null,
    Redes: Array.isArray(cityData.Redes) ? cityData.Redes.map(red => ({
      id: red.id,
      plataforma: red.plataforma,
      URL: red.URL
    })) : [],
    TocaExitos: processTocaExitos(cityData.TocaExitos),
    Locutor: Array.isArray(cityData.Locutor) ? cityData.Locutor.map(locutor => ({
      id: locutor.id,
      name: locutor.name,
      biodj: locutor.biodj,
      cargo: locutor.cargo,
      coverdj: locutor.coverdj ? {
        url: getMediaUrl(locutor.coverdj),
        documentId: locutor.coverdj.documentId
      } : null
    })) : []
  };
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

// Función helper para extraer ID de YouTube
const extractYoutubeId = (url) => {
  if (!url) return null;
  
  // Si ya es un ID directo, lo retornamos
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  
  // Patrones comunes de URLs de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Función helper para procesar entrevistas
const processEntrevistasData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    id: item.id,
    documentId: item.documentId,
    youtubeId: extractYoutubeId(item.urlyoutube),
    title: item.titulo,
    description: item.description,
    slug: item.slugentre,
    portada: item.portada ? {
      url: getMediaUrl(item.portada),
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
          'populate[coverlog][fields]': 'url',
          'populate[Programa][fields]': 'program_name,description,start_time,end_time,days',
          'populate[Programa][populate][imgprogram][fields]': 'url',
          'populate[Redes][fields]': 'plataforma,URL',
          'populate[TocaExitos][fields]': 'title,artist,rank',
          'populate[TocaExitos][populate][cover][fields]': 'url',
          'populate[TocaExitos][populate][song][fields]': 'url',
          'populate[apps][fields]': 'android,ios',
          'populate[Locutor][fields]': 'name,biodj,cargo',
          'populate[Locutor][populate][coverdj][fields]': 'url',
          'populate[Live][fields]': 'titulo,descripcion,url',
          'populate[logo][fields]': 'url',
          'fields': 'name,frequency,stream_url'
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
      const response = await api.get('/ciudades', {
        params: {
          'populate[coverlog][fields]': 'url',
          'populate[Programa][fields]': 'program_name,description,start_time,end_time,days',
          'populate[Programa][populate][imgprogram][fields]': 'url',
          'populate[Redes][fields]': 'plataforma,URL',
          'populate[TocaExitos][fields]': 'title,artist,rank',
          'populate[TocaExitos][populate][cover][fields]': 'url',
          'populate[TocaExitos][populate][song][fields]': 'url',
          'populate[apps][fields]': 'android,ios',
          'populate[Locutor][fields]': 'name,biodj,cargo',
          'populate[Locutor][populate][coverdj][fields]': 'url',
          'populate[Live][fields]': 'titulo,descripcion,url',
          'populate[logo][fields]': 'url',
          'fields': 'name,frequency,stream_url'
        }
      });

      if (!response.data?.data) {
        throw new Error('No se encontraron ciudades');
      }

      return response.data.data.map(cityData => processCityData(cityData));
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
  },

  async getTocaExitos() {
    try {
      const response = await api.get('/toca-exitos');
      return processTocaExitos(response.data.data);
    } catch (error) {
      console.error('Error fetching Toca Éxitos:', error);
      throw new Error('Error al cargar Toca Éxitos');
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