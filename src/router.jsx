import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TocaExitosPage } from './pages/TocaExitos';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { EntrevistasPage } from './pages/EntrevistasPage';
import { EntrevistaDetailPage } from './pages/EntrevistaDetailPage';
import { ProgramacionPage } from './pages/ProgramacionPage';
import { RootLayout } from './layouts/RootLayout';
import { ErrorPage } from './pages/ErrorPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
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
        },
        {
          path: 'entrevistas',
          element: <EntrevistasPage />
        },
        {
          path: 'entrevistas/:slug',
          element: <EntrevistaDetailPage />
        },
        {
          path: '/programacion',
          element: <ProgramacionPage />
        }
      ]
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);