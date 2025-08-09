import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NotFoundScreen() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose-300/30 blur-3xl" />

      <main className="relative z-10 w-full max-w-2xl mx-auto text-center px-6">
        <div className="mb-6 inline-flex items-center rounded-full border border-gray-200/60 bg-white/70 px-3 py-1 text-xs text-gray-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">⚠️</span>
          <span>
            We couldn’t find
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-gray-800 dark:bg-white/10 dark:text-gray-200">
              {location.pathname}
            </code>
          </span>
        </div>

        <h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent dark:from-white dark:via-gray-200 dark:to-gray-400">
          404
        </h1>
        <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Page not found
        </h2>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          The page you’re looking for doesn’t exist or has moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white shadow-lg shadow-gray-900/10 transition hover:shadow-gray-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:bg-white dark:text-gray-900 dark:shadow-white/10 dark:hover:shadow-white/20"
          >
            Go Home <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/80 px-5 py-3 font-medium text-gray-800 backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:border-white/15 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15"
          >
            Explore Art
          </Link>
        </div>

        <ul className="mt-6 text-sm text-gray-500 dark:text-gray-400 flex justify-center gap-4">
          <li><Link to="/contact" className="hover:underline">Contact us</Link></li>
          {/* <li>•</li>
          <li><Link to="/faq" className="hover:underline">FAQ</Link></li> */}
        </ul>
      </main>
    </div>
  );
}
