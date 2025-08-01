import React, { useState } from 'react';
import Meta from '../components/Meta';

const ContactScreen = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className=" px-4 sm:px-8 lg:px-24 py-12">
      <Meta title="Contact Us – Voices on Canvas" />

      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Let’s Talk</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Whether you’re an artist, collector, or partner, we’d love to hear from you.  
          Reach out and we’ll get back to you shortly.
        </p>
      </section>

      {/* Main layout */}
      <section className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Contact info card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8 hover:shadow-xl transition-shadow">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">📍 Address</h2>
            <p className="text-gray-700">123 Creative Avenue, Art District, New York, NY</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">✉️ Email</h2>
            <a
                            href="mailto:voicesofafrica.africa"

              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              support@voicesoncanvas.com
            </a>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">📞 Phone</h2>
            <a
              href="tel:+1234567890"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              +1 (234) 567-890
            </a>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Our team is available Monday–Friday, 9 AM – 6 PM (EST).
            </p>
          </div>
        </div>

        {/* Contact form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-6 hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Send Us a Message</h2>
          <p className="text-sm text-gray-500 mb-4">
            Fill out the form below and we’ll get back to you within 1–2 business days.
          </p>

          {submitted && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg font-medium">
              ✅ Thank you! Your message has been sent.
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="What is this about?"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="5"
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-black hover:bg-gray-200 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
};

export default ContactScreen;
