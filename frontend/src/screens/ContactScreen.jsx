import React, { useState } from 'react';
import Meta from '../components/Meta';

const ContactScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('https://www.formbackend.com/f/26884c7e4cee5aeb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Submission error:', err);
      setError('There was an error sending your message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Meta title="Contact Us – Voices on Canvas" description="Get in touch with our team for inquiries, partnerships, or support." />

      {/* Hero Section */}
      <section className="text-center mb-16 md:mb-20">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Connect With Us</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          We're here to help artists, collectors, and partners. Reach out with your questions or ideas—our team will respond promptly.
        </p>
      </section>

      {/* Contact Content */}
      <div className="grid lg:grid-cols-2 gap-12 xl:gap-16">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8 hover:shadow-md transition-all duration-200">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">Our Location</h2>
            </div>
            <p className="text-gray-700 pl-9">123 Creative Avenue, Art District<br />New York, NY 10001</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">Email Us</h2>
            </div>
            <a
              href="mailto:support@voicesoncanvas.com"
              className="text-blue-600 hover:text-blue-700 transition-colors pl-9"
            >
              support@voicesoncanvas.com
            </a>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">Call Us</h2>
            </div>
            <a
              href="tel:+1234567890"
              className="text-blue-600 hover:text-blue-700 transition-colors pl-9"
            >
              +1 (234) 567-890
            </a>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Office Hours:</span> Monday–Friday, 9 AM – 6 PM EST
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-8 space-y-6 hover:shadow-md transition-all duration-200"
        >
          <h2 className="text-2xl font-semibold text-gray-900">Send a Message</h2>
          <p className="text-sm text-gray-500 mb-6">
            We typically respond within 24-48 hours during business days.
          </p>

          {submitted && (
            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Thank you! Your message has been sent successfully.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="What's this about?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex justify-center items-center space-x-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg> */}
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactScreen;