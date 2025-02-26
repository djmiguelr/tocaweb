import { Header } from './Header';
import { Footer } from './Footer';
import { Player } from './Player';
import { CitySelectorModal } from '../Layout/CitySelectorModal';

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Player />
      <CitySelectorModal />
    </div>
  );
}