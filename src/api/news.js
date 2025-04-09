import axios from 'axios';

const API_URL = 'https://api.voltajedigital.com';

// Mock data temporal mientras se resuelve el problema de conexión
const mockNews = {
  data: [
    {
      documentId: '1',
      title: 'Nuevo éxito musical rompe récords en streaming',
      slug: 'nuevo-exito-musical-rompe-records',
      excerpt: 'La última canción del artista ha superado todas las expectativas en las plataformas digitales.',
      featured_image: {
        url: 'https://picsum.photos/800/600?random=1'
      },
      categoria: {
        name: 'Música'
      }
    },
    {
      documentId: '2',
      title: 'Festival de verano anuncia lineup internacional',
      slug: 'festival-verano-lineup',
      excerpt: 'El evento más esperado del año revela su cartel con artistas de talla mundial.',
      featured_image: {
        url: 'https://picsum.photos/800/600?random=2'
      },
      categoria: {
        name: 'Eventos'
      }
    },
    {
      documentId: '3',
      title: 'Entrevista exclusiva con estrella emergente',
      slug: 'entrevista-estrella-emergente',
      excerpt: 'Conversamos con el nuevo talento que está revolucionando la escena musical.',
      featured_image: {
        url: 'https://picsum.photos/800/600?random=3'
      },
      categoria: {
        name: 'Entrevistas'
      }
    },
    {
      documentId: '4',
      title: 'Los mejores momentos del concierto del año',
      slug: 'mejores-momentos-concierto',
      excerpt: 'Revive los highlights del evento que paralizó la ciudad el fin de semana.',
      featured_image: {
        url: 'https://picsum.photos/800/600?random=4'
      },
      categoria: {
        name: 'Eventos'
      }
    }
  ]
};

export async function fetchLatestNews({ limit = 10, offset = 0 } = {}) {
  try {
    // Comentado temporalmente mientras se resuelve el problema de conexión
    /*const response = await axios.get(`${API_URL}/api/noticias`, {
      params: {
        'pagination[limit]': limit,
        'pagination[start]': offset,
        'sort[0]': 'published:desc',
      },
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    return response.data;*/

    // Retornar datos mock
    return mockNews;
  } catch (error) {
    console.error('Error fetching latest news:', error);
    throw error;
  }
}
