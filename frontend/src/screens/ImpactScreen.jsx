import React from 'react';
import { Link } from 'react-router-dom';
import Meta from '../components/Meta';

const ImpactScreen = () => {
  return (
    <div className=" px-4 sm:px-6 md:px-12 lg:px-24 py-10 sm:py-14">
      <Meta title="Our Impact – Voices on Canvas" />

      {/* Hero */}
      <section className="text-center mb-16">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
        >
          Driving Impact in the Global Art Community
        </h1>
        <p
          className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
        >
          Voices on Canvas exists to do more than showcase art. We enable artists to build sustainable careers, foster collaboration, and reach collectors worldwide—making a tangible impact on creative communities every day.
        </p>
      </section>

      {/* How we support artists */}
      <section className="grid md:grid-cols-2 gap-10 items-center mb-20">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
            Empowering Artists, Enriching Communities
          </h2>
          <ul className="list-disc list-inside space-y-4 text-gray-700 leading-relaxed">
            <li>
              <span className="font-medium text-gray-900">Global Exposure:</span> Our platform showcases artists to audiences beyond borders, unlocking new markets and opportunities.
            </li>
            <li>
              <span className="font-medium text-gray-900">Revenue that Matters:</span> Every sale directly supports artists, allowing them to reinvest in their craft and grow their portfolios.
            </li>
            <li>
              <span className="font-medium text-gray-900">Collaborative Growth:</span> Through curated programs, forums, and partnerships, we encourage knowledge sharing and mutual support.
            </li>
          </ul>
        </div>
        <div>
          <img
            src="/images/impact.webp"
            alt="Artists collaborating"
            className="rounded-xl shadow-md object-cover w-full h-72 sm:h-80 md:h-96"
            loading="lazy"
          />
        </div>
      </section>

      {/* Initiatives */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-10 text-center">
          Initiatives That Drive Our Mission
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Professional Development',
              icon: '🎨',
              description: 'We host online workshops, portfolio reviews, and masterclasses led by industry experts, helping artists elevate their practice and market themselves effectively.',
            },
            {
              title: 'Global Exhibitions',
              icon: '🌍',
              description: 'Our virtual and in-person exhibitions connect artists with collectors, galleries, and curators worldwide—opening doors that might otherwise remain closed.',
            },
            {
              title: 'Grants & Sponsorships',
              icon: '🤝',
              description: 'A portion of our revenue funds micro-grants and sponsorships, supporting art supplies, residencies, and community projects that make a lasting impact.',
            },
          ].map((initiative, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                {initiative.icon} {initiative.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">{initiative.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-10 text-center">
          What Artists Are Saying
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              quote: '“Voices on Canvas gave me the visibility and confidence I needed. Within months, I connected with collectors from three continents.”',
              author: 'Aisha O., Painter',
            },
            {
              quote: '“The mentorship programs and grants helped me transition from hobbyist to full-time artist. This platform truly invests in us.”',
              author: 'Daniel K., Digital Artist',
            },
          ].map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <p className="italic text-gray-700 leading-relaxed">{testimonial.quote}</p>
              <p className="mt-4 text-sm text-gray-600 font-medium">— {testimonial.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="text-center">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4"
        >
          Join Us in Shaping the Future of Art
        </h2>
        <p
          className="text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Whether you’re an emerging artist or a seasoned creator, Voices on Canvas is here to amplify your voice and connect you to a global community. Let’s make art thrive, together.
        </p>
        <div>
          <Link
            to="/register"
            className="inline-block bg-black text-white font-medium px-6 py-2 rounded-lg transition-transform transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ImpactScreen;