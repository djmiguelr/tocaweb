import { useState, useEffect } from 'react';
import { useCity } from '../../context/CityContext';
import { MainSlider } from './MainSlider';
import { NewsSection } from './NewsSection';
// ... resto de importaciones

export function HomePage() {
  const { selectedCity, isLoading, error } = useCity();

  useEffect(() => {
    console.log('HomePage render:', { selectedCity, isLoading, error });
  }, [selectedCity, isLoading, error]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 space-y-8">
      <MainSlider />
      <NewsSection />
    </div>
  );
} 