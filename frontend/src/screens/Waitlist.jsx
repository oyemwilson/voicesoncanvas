import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Seller-focused landing page with CTA button that takes artists to the /waitlist form
// TailwindCSS styles; no inline form here — just a clear CTA for sellers

export default function ArtSellerLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fffbe6]">
      {/* Minimal brand bar (no site-wide header/footer here) */}
      <nav className="flex justify-center items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center text-center space-x-2 flex justify-center">

          <img
            src="/images/voclogo.png"
            className="h-32 "
            alt="Voices on Canvas Logo"
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 pt-0 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Start selling your <span className="text-transparent bg-clip-text bg-yellow-500">art worldwide</span>
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mb-10">
          VoicesOnCanvas is built for creators. Open your no‑code storefront, get secure payouts, ship with live rates, and track performance with seller analytics.
        </p>

        <div className="relative md:h-[300px] h-[200px] w-[90vw] sm:w-[650px] md:w-[800px] mb-10">
          <img
            src="/images/waitlist.webp"
            alt="Our Mission"
            className="rounded-xl object-cover w-full h-full shadow-lg"
          />
        </div>

        {/* CTA: Takes seller to the dedicated waitlist form route */}
        <div className="w-full max-w-md">


          <Link
            to="https://docs.google.com/forms/d/e/1FAIpQLSdi14RyPBznZmCIm5EHVetE6dDt9gxjNBRa3OLH8pzgdzACXQ/viewform?usp=header"
            className="w-full bg-yellow-500 text-white py-3 rounded-lg font-medium hover:bg-yellow-600 transition-all duration-300 flex items-center justify-center"
          >
            Join Seller Waitlist
          </Link>

          <p className="text-sm text-gray-500 mt-4">Early sellers get reduced commission and priority placement at launch.</p>
        </div>
      </section>

      {/* Seller Benefits */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why sell on VoicesOnCanvas?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Zero‑setup storefront</h3>
              <p className="text-gray-600">Publish originals, editions, framing & sizes in minutes — no code required.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.657 0 3-1.567 3-3.5S13.657 1 12 1 9 2.567 9 4.5 10.343 8 12 8zm0 0v13" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure payouts</h3>
              <p className="text-gray-600">Escrowed payments; fast payouts via Paystack/Stripe once tracking is confirmed.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h10M5 20h14" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Shipping & analytics</h3>
              <p className="text-gray-600">Live carrier rates, insured labels & tracking, plus views, favorites & conversion data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Soft footer text, no site chrome */}
      <div className="py-10 text-center text-gray-500 text-sm"> © {new Date().getFullYear()} VoicesOnCanvas</div>
    </div>
  );
}
