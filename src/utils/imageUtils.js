const API_BASE_URL = 'https://api.voltajedigital.com';

export const getImageUrl = (url) => {
  if (!url) return null;
  
  // Si la URL ya es absoluta, retornarla como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si es una ruta relativa, agregarle el dominio base
  return url.startsWith('/') ? `${API_BASE_URL}${url}` : `${API_BASE_URL}/${url}`;
};
