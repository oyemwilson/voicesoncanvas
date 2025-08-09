// src/components/StudioCarousel.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


const slides = [
  {
    id: 1,
    imageUrl: '/images/artgallery1.webp',
    title: 'Artists: Reach Thousands of Buyers',
    description:
      'Join our vibrant community of creators—showcase your work, build your audience, and sell directly to art enthusiasts around the world.',
    buttonText: 'Sign Up to Sell',
    buttonLink: '/register',
  },
  {
    id: 2,
    imageUrl: '/images/artgallery2.webp',
    title: 'Collectors: Discover Exclusive Pieces',
    description:
      'Browse curated collections of original artworks and limited editions—sign up now to start buying one-of-a-kind treasures.',
    buttonText: 'Sign Up to Buy',
    buttonLink: '/register',
  },
  {
    id: 3,
    imageUrl: '/images/artgallery3.webp',
    title: 'Grow Your Artistic Brand',
    description:
      'Upload your portfolio, tell your story, and connect with galleries and buyers—create your free artist profile today.',
    buttonText: 'Join as Artist',
    buttonLink: '/register',
  },
  {
    id: 4,
    imageUrl: '/images/artgallery4.webp',
    title: 'Be First to See New Drops',
    description:
      'Stay ahead of the curve—sign up for access to pre-release exhibitions, limited-edition launches, and special offers.',
    buttonText: 'Join to Explore',
    buttonLink: '/register',
  },
];



export default function StudioCarousel() {
  return (
  <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-[2vh] ">
      <Swiper
        modules={[ Pagination, Autoplay]}
       pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="w-full rounded overflow-hidden"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full md:h-[650px] h-[500px]">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full  object-cover"
              />
                            {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/45 "></div>
<div className="absolute inset-0 flex flex-col justify-center items-center md:items-start p-6 text-white  md:text-left md:ml-16">
  <h2 className="text-5xl sm:text-3xl md:text-5xl font-bold">{slide.title}</h2>
  <p className="mt-2 text-lg sm:text-xl">{slide.description}</p>
  <Link
    to={slide.buttonLink}
    className="mt-4 bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded text-lg transition-colors duration-200"
  >
    {slide.buttonText}
  </Link>
</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}