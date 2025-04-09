import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { TocaExitosPage } from './pages/TocaExitos';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { AuthorPage } from './pages/AuthorPage';
import { CategoryPage } from './pages/CategoryPage';
import { TagPage } from './pages/TagPage';
import { EntrevistasPage } from './pages/EntrevistasPage';
import { EntrevistaDetailPage } from './pages/EntrevistaDetailPage';
import { LivePage } from './pages/LivePage';
import { ProgramacionPage } from './pages/ProgramacionPage';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsAndConditions } from './pages/legal/TermsAndConditions';
import { CookiePolicy } from './pages/legal/CookiePolicy';
import { LegalNotice } from './pages/legal/LegalNotice';
import { SiteMap } from './pages/SiteMap';
import { CookieConsent } from './components/Cookie/CookieConsent';
import { CityProvider } from './context/CityContext';
import { PlayerProvider } from './context/PlayerContext';
import { HeaderProvider } from './context/HeaderContext';

// Importar estilos
import './styles/scrollbar-hide.css';

// Configuración de las banderas futuras de React Router
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HeaderProvider>
        <CityProvider>
          <PlayerProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/toca-exitos" element={<TocaExitosPage />} />
                <Route path="/noticias" element={<NewsPage />} />
                <Route path="/noticias/:slug" element={<NewsDetailPage />} />
                <Route path="/autor/:slug" element={<AuthorPage />} />
                <Route path="/categoria/:slug" element={<CategoryPage />} />
                <Route path="/tags/:slug" element={<TagPage />} />
                <Route path="/entrevistas" element={<EntrevistasPage />} />
                <Route path="/entrevistas/:slug" element={<EntrevistaDetailPage />} />
                <Route path="/live" element={<LivePage />} />
                <Route path="/programacion" element={<ProgramacionPage />} />
                
                {/* Rutas legales */}
                <Route path="/legal/privacidad" element={<PrivacyPolicy />} />
                <Route path="/legal/terminos" element={<TermsAndConditions />} />
                <Route path="/legal/cookies" element={<CookiePolicy />} />
                <Route path="/legal/aviso-legal" element={<LegalNotice />} />
                
                <Route path="/sitemap" element={<SiteMap />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
            <CookieConsent />
          </Router>
          </PlayerProvider>
        </CityProvider>
      </HeaderProvider>
    </QueryClientProvider>
  );
}

export default App;