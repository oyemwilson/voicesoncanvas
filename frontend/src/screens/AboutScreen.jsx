import React from 'react';
import Meta from '../components/Meta';
import { Link } from 'react-router-dom';

const AboutScreen = () => {
  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 ">
      <Meta title="About Us – Voices on Canvas" />

      {/* Hero Section */}
      <section className="text-center mb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Voices on Canvas
          </h1>
          <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 mb-6">
            The Echoes of Africa
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            VoC is an e‑commerce platform showcasing African artistry, primarily featuring paintings from Nigeria and beyond. We bridge the gap between talented African artists and international collectors, fostering cultural exchange and economic empowerment.
          </p>
        </div>
      </section>

      {/* Business Description */}
      <section className="grid md:grid-cols-2 gap-12 items-center mb-24 bg-white rounded-2xl shadow-sm p-8 sm:p-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 relative">
            <span className="relative">
              About VoC
              <span className="absolute -bottom-2 left-0 w-16 h-1 bg-yellow-500"></span>
            </span>
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Voices on Canvas is a premier global marketplace dedicated to elevating African artistic talent. We provide a direct connection between artists and international buyers, offering authentic, high-quality art, fashion, home décor, and crafts while promoting cultural appreciation.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            Every transaction on our platform fuels sustainable growth in creative communities across Africa, preserving heritage while fostering innovation. We're building bridges between continents through the universal language of art.
          </p>
        </div>
        <div className="relative h-full min-h-[300px]">
          <img
            src="/images/vision.webp"
            alt="African Art Marketplace"
            className="rounded-xl object-cover w-full h-full shadow-lg"
          />
        </div>
      </section>

      {/* Mission Statement */}
      <section className="grid md:grid-cols-2 gap-12 items-center mb-24 bg-white rounded-2xl shadow-sm p-8 sm:p-10">
        <div className="relative h-full min-h-[300px] order-1 md:order-2">
          <img
            src="/images/mission.webp"
            alt="Our Mission"
            className="rounded-xl object-cover w-full h-full shadow-lg"
          />
        </div>
        <div className="order-2 md:order-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 relative">
            <span className="relative">
              Our Mission
              <span className="absolute -bottom-2 left-0 w-16 h-1 bg-yellow-500"></span>
            </span>
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            We exist to empower African artists by providing a global stage for their work, amplifying their voices, and creating sustainable livelihoods. Through curated collections, we connect discerning buyers with authentic pieces that carry the soul of Africa while preserving cultural narratives for future generations.
          </p>
        </div>
      </section>

      {/* Vision Statement */}
      <section className="text-center mb-24 bg-white rounded-2xl shadow-sm p-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 relative inline-block">
            <span className="relative">
              Our Vision
              <span className="absolute -bottom-2 left-0 right-0 w-16 h-1 bg-yellow-500 mx-auto"></span>
            </span>
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            To establish the definitive global platform for African creativity—where each transaction weaves together cultural heritage, artistic innovation, and economic empowerment, creating a vibrant tapestry of shared human experience.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-r from-yellow-50 to-gray-50 rounded-2xl p-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Join Our Artistic Movement
          </h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Whether you're an artist ready to share your vision, a collector seeking authentic pieces, or a supporter of creative entrepreneurship, we invite you to be part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
<Link
            to="/register"
            className="inline-block border-2 border-gray-800 hover:bg-gray-800 hover:text-white text-gray-800 font-semibold px-8 py-2 rounded-lg transition-colors duration-200"
          >
            Register
          </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutScreen;