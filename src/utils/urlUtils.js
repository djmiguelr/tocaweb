export const API_BASE_URL = 'https://api.voltajedigital.com';
export const SITE_URL = 'https://tocastereo.co';

export function getFullImageUrl(imageUrl) {
  if (!imageUrl) return null;
  
  // Si ya es una URL completa, retornarla
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si comienza con /uploads/, agregarla a la URL base
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  // Si comienza con uploads/, agregarla a la URL base con barra
  if (imageUrl.startsWith('uploads/')) {
    return `${API_BASE_URL}/${imageUrl}`;
  }

  // Si comienza con otra barra, agregarla a la URL base
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  // Para cualquier otro caso, asumimos que es una ruta relativa a /uploads/
  return `${API_BASE_URL}/uploads/${imageUrl}`;
}

export function getSiteUrl(path = '') {
  if (!path) return SITE_URL;
  
  // Asegurarse de que el path comience con /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
