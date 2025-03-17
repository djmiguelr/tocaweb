import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'd MMM yyyy', { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};
