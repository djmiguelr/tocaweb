import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CityProvider } from './context/CityContext';
import { PlayerProvider } from './context/PlayerContext';
import { HeaderProvider } from './context/HeaderContext';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { TocaExitosPage } from './pages/TocaExitos';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { EntrevistasPage } from './pages/EntrevistasPage';
import { EntrevistaDetailPage } from './pages/EntrevistaDetailPage';

// Importar estilos
import './styles/scrollbar-hide.css';

// Configuración de las banderas futuras de React Router
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

export function App() {
  return (
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
                <Route path="/entrevistas" element={<EntrevistasPage />} />
                <Route path="/entrevistas/:slug" element={<EntrevistaDetailPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </PlayerProvider>
      </CityProvider>
    </HeaderProvider>
  );
}

export default App;