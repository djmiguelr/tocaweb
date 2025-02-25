import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CityProvider } from './context/CityContext';
import { PlayerProvider } from './context/PlayerContext';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { TocaExitosPage } from './pages/TocaExitos';
import { CitySelectorModal } from './components/Home/CitySelectorModal';

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
    <Router>
      <CityProvider>
        <PlayerProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/toca-exitos" element={<TocaExitosPage />} />
              {/* Aquí irán más rutas cuando las implementemos */}
            </Routes>
          </Layout>
          <CitySelectorModal />
        </PlayerProvider>
      </CityProvider>
    </Router>
  );
}

export default App;