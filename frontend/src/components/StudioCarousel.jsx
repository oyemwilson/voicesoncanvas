// src/components/StudioCarousel.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
  {
    id: 1,
    imageUrl: '/images/art1.jpg',
    title: 'Modern Art Piece',
    description: 'Discover the vibrant colors and textures.',
    buttonText: 'Explore',
    buttonLink: '/gallery/1',
  },
  {
    id: 2,
    imageUrl: '/images/art2.jpg',
    title: 'Abstract Masterpiece',
    description: 'A journey into abstract expression.',
    buttonText: 'Learn More',
    buttonLink: '/gallery/2',
  },
  {
    id: 3,
    imageUrl: '/images/art3.jpg',
    title: 'Classic Sculpture',
    description: 'Timeless elegance in stone.',
    buttonText: 'View Detail',
    buttonLink: '/gallery/3',
  },
];

export default function StudioCarousel() {
  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-[2vh]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="w-full rounde overflow-hidden"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="w-full">
            <div className="relative w-full h-96 md:h-[500px] lg:h-[600px]">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-start p-6 md:p-12 text-white">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
                  {slide.title}
                </h2>
                <p className="mb-4 md:mb-6 max-w-md md:max-w-lg text-sm md:text-base lg:text-lg">
                  {slide.description}
                </p>
                <a
                  href={slide.buttonLink}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-colors duration-300"
                >
                  {slide.buttonText}
                </a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}