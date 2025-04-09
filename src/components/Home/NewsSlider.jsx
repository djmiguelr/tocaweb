import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import DOMPurify from 'dompurify';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export function NewsSlider() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const params = new URLSearchParams({
          'sort[0]': 'published:desc',
          'pagination[limit]': '10',
          'populate[featured_image][fields][0]': 'url',
          'populate[featured_image][fields][1]': 'formats',
          'populate[categoria][fields][0]': 'name',
          'populate[categoria][fields][1]': 'slug',
        });

        const response = await fetch(`https://api.voltajedigital.com/api/noticias?${params}`);
        if (!response.ok) throw new Error('Error al cargar las noticias');
        
        const data = await response.json();
        setNews(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-800 h-[600px] rounded-xl overflow-hidden relative">
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
          <div className="h-8 bg-gray-700 rounded-full w-32"></div>
          <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  };
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="relative group">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        pagination={{
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="${className} !w-2 !h-2 !bg-white/50 !opacity-100 !mx-1 hover:!bg-primary transition-colors"></span>`;
          },
        }}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        className="w-full h-[600px] rounded-xl overflow-hidden"
      >
      {news.map((article) => {
        const imageUrl = article.featured_image?.formats?.large?.url || 
                        article.featured_image?.formats?.medium?.url ||
                        article.featured_image?.formats?.small?.url ||
                        article.featured_image?.url ||
                        '/placeholder-news.jpg';
        
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `https://api.voltajedigital.com${imageUrl}`;

        return (
          <SwiperSlide key={article.id}>
            <Link 
              to={`/noticias/${article.slug}`}
              className="relative block w-full h-full group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-500 ease-out z-10"></div>
              <img
                src={fullImageUrl}
                alt={article.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute bottom-0 left-0 right-0 p-12 z-20 transform transition-transform duration-500 ease-out group-hover:translate-y-[-8px]">
                <div className="space-y-4">
                  <span className="inline-block px-4 py-2 bg-primary text-white text-sm font-medium rounded-full transform hover:scale-105 transition-transform duration-300 ease-out hover:shadow-lg hover:shadow-primary/20">
                    {article.categoria?.name || 'Noticias'}
                  </span>
                  <h2 className="text-4xl font-bold text-white group-hover:text-primary transition-colors duration-300 ease-out leading-tight">
                    {article.title}
                  </h2>
                  <p className="text-gray-200 text-lg line-clamp-2 max-w-3xl">
                    {DOMPurify.sanitize(article.excerpt || '', { ALLOWED_TAGS: [] })}
                  </p>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        );
      })}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button
        ref={prevRef}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-primary transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <BiChevronLeft className="w-6 h-6" />
      </button>
      <button
        ref={nextRef}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-primary transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <BiChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
