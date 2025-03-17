import React from 'react';
import { AdUnit } from './AdUnit';

// Anuncio en el header
export const HeaderAd = () => (
  <div className="w-full max-w-[970px] mx-auto">
    <AdUnit
      slot="1234567890" // Reemplazar con tu slot real
      format="horizontal"
      style={{ minHeight: '90px' }}
    />
  </div>
);

// Anuncio en la barra lateral
export const SidebarAd = () => (
  <div className="sticky top-24">
    <AdUnit
      slot="0987654321" // Reemplazar con tu slot real
      format="vertical"
      style={{ minHeight: '600px' }}
    />
  </div>
);

// Anuncio entre contenido
export const InArticleAd = () => (
  <div className="my-8">
    <AdUnit
      slot="1357924680" // Reemplazar con tu slot real
      format="rectangle"
      style={{ minHeight: '250px' }}
    />
  </div>
);

// Anuncio responsivo
export const ResponsiveAd = () => (
  <div className="my-6">
    <AdUnit
      slot="2468013579" // Reemplazar con tu slot real
      format="auto"
      responsive={true}
    />
  </div>
);
