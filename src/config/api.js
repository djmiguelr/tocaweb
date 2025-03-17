export const API_CONFIG = {
  // URL Base según la documentación
  BASE_URL: 'https://api.voltajedigital.com/api',
  TOKEN: 'dc15f760ddd714d845b77a9b916f7e49877cbdf90c83e020527bf890c157f234c9b4b60de755d05341cf2d808705cfb715341c149f08f9bad39da359146fd34062665cbdc41d367772ece23c0e4cfd0fda71188b177567712d39b2050d28bf78b777b0627993bccf4bc73ce75d271489758040bfd3dfc4f205264566fd73b89d',
  DEFAULT_NEWS_PARAMS: [
    // Campos requeridos según la documentación
    'fields[0]=documentId',
    'fields[1]=title',
    'fields[2]=slug',
    'fields[3]=excerpt',
    'fields[4]=image_source',
    'fields[5]=published',
    'fields[6]=content',
    // Relaciones populadas según la documentación
    'populate[featured_image][fields][0]=url',
    'populate[author][fields][0]=name',
    'populate[author][fields][1]=bio',
    'populate[author][fields][2]=slug',
    'populate[author][populate][avatar][fields][0]=url',
    'populate[categoria][fields][0]=name',
    'populate[categoria][fields][1]=slug',
    'populate[tags][fields][0]=Nombre',
    'populate[tags][fields][1]=slug'
  ].join('&')
};
