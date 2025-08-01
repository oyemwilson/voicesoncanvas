import React from 'react';
import Meta from '../components/Meta';

const AboutScreen = () => {
  return (
    <div className=" px-4 sm:px-6 md:px-12 lg:px-24 py-10 sm:py-14">
      <Meta title="About Us – Voices on Canvas" />

      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          About Voices on Canvas
        </h1>
        <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          We are a platform built to celebrate creativity, empower artists, and connect art lovers around the world.  
        </p>
      </section>

      {/* Mission */}
      <section className="grid md:grid-cols-2 gap-10 items-center mb-20">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
            Our Mission
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our mission is simple yet powerful: to enable artists everywhere to thrive by giving them a platform to share their work with a global audience.  
            We believe art has the power to shape culture, spark dialogue, and create lasting impact—and we’re here to make sure every artist’s voice is heard.
          </p>
        </div>
        <div>
          <img
            src="/images/about-mission.jpg"
            alt="Our Mission"
            className="rounded-xl shadow-md object-cover w-full h-72 sm:h-80"
          />
        </div>
      </section>

      {/* Story */}
      <section className="grid md:grid-cols-2 gap-10 items-center mb-20 md:flex-row-reverse">
        <div className="order-2 md:order-1">
          <img
            src="/images/about-story.jpg"
            alt="Our Story"
            className="rounded-xl shadow-md object-cover w-full h-72 sm:h-80"
          />
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
            Our Story
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Voices on Canvas started with a simple idea in a small studio: art deserves to be seen.  
            What began as a collective of independent artists sharing their work has evolved into a global platform that connects thousands of creators and collectors.  
            Over the years, we’ve grown alongside our community—shaped by their talent, passion, and relentless creativity.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-10 text-center">
          What We Do
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-gray-900">🌐 Global Marketplace</h3>
            <p className="text-gray-700 leading-relaxed">
              We provide a trusted platform where artists can list and sell their work to buyers all over the world.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-gray-900">🤝 Community Building</h3>
            <p className="text-gray-700 leading-relaxed">
              We foster connections through events, forums, and curated programs that encourage collaboration and growth.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-gray-900">📈 Artist Development</h3>
            <p className="text-gray-700 leading-relaxed">
              From marketing support to mentorship opportunities, we invest in artists’ long‑term success.
            </p>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="text-center mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
          Our Vision
        </h2>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
          We envision a world where art knows no boundaries, where creators are celebrated and fairly compensated, and where every collector can discover pieces that resonate with their soul.  
          Voices on Canvas is here to make that vision a reality—one artist, one story, one masterpiece at a time.
        </p>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
          Be Part of Our Journey
        </h2>
        <p className="text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
          Whether you’re here to showcase your art, discover new talent, or support a thriving creative ecosystem, we welcome you to join us.
        </p>
        <a
          href="/register"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition"
        >
          Join the Community
        </a>
      </section>
    </div>
  );
};

export default AboutScreen;
