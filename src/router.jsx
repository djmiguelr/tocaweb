import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TocaExitosPage } from './pages/TocaExitos';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <HomePage />
    },
    {
      path: '/toca-exitos',
      element: <TocaExitosPage />
    },
    {
      path: '/noticias',
      element: <NewsPage />
    },
    {
      path: '/noticias/:slug',
      element: <NewsDetailPage />
    },
    {
      path: '/noticias/categoria/:category',
      element: <NewsPage />
    },
    {
      path: '/secciones',
      element: <NewsPage />
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);