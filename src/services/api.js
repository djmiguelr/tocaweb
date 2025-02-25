export const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.voltajedigital.com';

export async function getTocaExitos() {
  try {
    const response = await fetch(`${BASE_URL}/api/toca-exitos?populate=*&pagination[limit]=-1`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    if (!data || !data.data) {
      console.error('Invalid response format:', data);
      return [];
    }

    // Process and map the data to ensure consistent structure
    const processedData = data.data.map(item => ({
      id: item.id,
      ...item.attributes,
      cover: item.attributes?.cover?.data?.attributes?.url ? {
        url: `${BASE_URL}${item.attributes.cover.data.attributes.url}`,
        documentId: item.attributes.cover?.documentId
      } : null,
      song: item.attributes?.song?.data?.attributes?.url ? {
        url: `${BASE_URL}${item.attributes.song.data.attributes.url}`,
        documentId: item.attributes.song?.documentId
      } : null
    }));

    return processedData;
  } catch (error) {
    console.error('Error fetching TocaExitos:', error);
    return [];
  }
}

export async function getTocaExitosByCity(documentId) {
  try {
    if (!documentId) {
      console.error('No documentId provided');
      return [];
    }

    const response = await fetch(`${BASE_URL}/api/ciudades?filters[documentId][$eq]=${documentId}&populate[TocaExitos][populate]=*`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    if (!data.data || !data.data[0] || !data.data[0].attributes.TocaExitos) {
      return [];
    }

    return data.data[0].attributes.TocaExitos;
  } catch (error) {
    console.error('Error fetching TocaExitos by city:', error);
    return [];
  }
}

export const api = {
  BASE_URL,

  async getHeader() {
    try {
      const response = await fetch(`${BASE_URL}/api/header?populate=*`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching header:', error);
      return { data: null };
    }
  },

  async getCities() {
    try {
      const response = await fetch(`${BASE_URL}/api/ciudades?populate=*&populate[TocaExitos][populate]=*&populate[coverlog][populate]=*&populate[logo][populate]=*&populate[Redes][populate]=*`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data || !data.data) {
        console.error('Invalid response format:', data);
        return { data: [] };
      }

      // Process and map the data to ensure consistent structure
      const processedData = data.data.map(city => ({
        id: city.id,
        ...city.attributes,
        name: city.attributes.name,
        frequency: city.attributes.frequency,
        stream_url: city.attributes.stream_url,
        logo: city.attributes.logo?.data?.attributes ? {
          url: `${BASE_URL}${city.attributes.logo.data.attributes.url}`,
          documentId: city.attributes.logo?.documentId
        } : null,
        coverlog: city.attributes.coverlog?.data?.attributes ? {
          url: `${BASE_URL}${city.attributes.coverlog.data.attributes.url}`,
          documentId: city.attributes.coverlog?.documentId
        } : null,
        Locutor: (city.attributes.Locutor?.data || []).map(locutor => ({
          id: locutor.id,
          ...locutor.attributes,
          imagen: locutor.attributes?.imagen?.data?.attributes ? {
            url: `${BASE_URL}${locutor.attributes.imagen.data.attributes.url}`
          } : null
        })),
        Programa: (city.attributes.Programa?.data || []).map(programa => ({
          id: programa.id,
          ...programa.attributes,
          imagen: programa.attributes?.imagen?.data?.attributes ? {
            url: `${BASE_URL}${programa.attributes.imagen.data.attributes.url}`
          } : null
        })),
        Redes: city.attributes.Redes?.data || [],
        TocaExitos: (city.attributes.TocaExitos?.data || []).map(exito => ({
          id: exito.id,
          ...exito.attributes,
          cover: exito.attributes?.cover?.data?.attributes ? {
            url: `${BASE_URL}${exito.attributes.cover.data.attributes.url}`
          } : null,
          song: exito.attributes?.song?.data?.attributes ? {
            url: `${BASE_URL}${exito.attributes.song.data.attributes.url}`
          } : null
        })),
        apps: city.attributes.apps?.data || []
      }));

      return { data: processedData };
    } catch (error) {
      console.error('Error fetching cities:', error);
      return { data: [] };
    }
  },

  async getCityTocaExitos(documentId) {
    return getTocaExitosByCity(documentId);
  },

  async getCityContent(cityId) {
    try {
      if (!cityId) {
        console.error('No city ID provided');
        return { data: null };
      }

      const response = await fetch(
        `${BASE_URL}/api/ciudades/${cityId}?populate[Locutor][populate]=*&populate[TocaExitos][populate]=*&populate[Programa][populate]=*&populate[Redes][populate]=*&populate[apps][populate]=*`
      );

      if (!response.ok) {
        console.error(`Error fetching city content: ${response.status}`);
        return { data: null };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching city content:', error);
      return { data: null };
    }
  },

  async getSliders() {
    try {
      const response = await fetch(`${BASE_URL}/api/sliders?populate=*`);
      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching sliders:', error);
      return [];
    }
  },

  async getNews() {
    try {
      const response = await fetch(`${BASE_URL}/api/noticias?populate=*`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data || !data.data) {
        console.error('Invalid response format:', data);
        return [];
      }
      return data.data.map(item => ({
        id: item.id,
        ...item.attributes,
        Imagendestacada: item.attributes?.Imagendestacada?.data?.attributes ? {
          url: `${BASE_URL}${item.attributes.Imagendestacada.data.attributes.url}`,
          documentId: item.attributes.Imagendestacada?.documentId
        } : null
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  },

  async getTocaEntrevistas() {
    try {
      const response = await fetch(`${BASE_URL}/api/toca-entrevistas?populate=*`);
      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching interviews:', error);
      return [];
    }
  }
};