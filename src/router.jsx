import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorPage } from './components/ErrorPage';
import { 
  HomePage,
  TocaExitosPage,
  EntrevistasPage,
  ProgramacionPage,
  LivePage,
  NewsPage,
  NewsDetailPage,
  AuthorPage,
  CategoryPage,
  TagPage,
} from './pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'toca-exitos',
        element: <TocaExitosPage />,
      },
      {
        path: 'entrevistas',
        element: <EntrevistasPage />,
      },
      {
        path: 'programacion',
        element: <ProgramacionPage />,
      },
      {
        path: 'live',
        element: <LivePage />,
      },
      {
        path: 'noticias',
        element: <NewsPage />,
      },
      {
        path: 'noticias/:slug',
        element: <NewsDetailPage />,
      },
      {
        path: 'autor/:slug',
        element: <AuthorPage />,
      },
      {
        path: 'categoria/:slug',
        element: <CategoryPage />,
      },
      {
        path: 'tags/:slug',
        element: <TagPage />,
      },
    ],
  },
]);