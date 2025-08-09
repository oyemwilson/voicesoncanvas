import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Dribbble } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#faf2e7]">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <img
                src="/images/Logo.png"
                className="h-8 me-3"
                alt="Voices on Canvas Logo"
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap">
                Stay Connected
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">
                Resources
              </h2>
              <ul className="text-gray-500 font-medium">
                {/* <Link to="/" className="block hover:text-black" >Home</Link>
                <Link to="/shop" className="block hover:text-black" >Shop</Link> */}
                <Link to="/artists" className="block hover:text-black mb-2" >Artist Profiles</Link>
                <Link to="/impact" className="block hover:text-black mb-2" >Impact</Link>
                <Link to="/about" className="block hover:text-black mb-2" >About Us</Link>
                <Link to="/blogs" className="block hover:text-black mb-2" >Blog</Link>
                <Link to="/contact" className="block hover:text-black mb-2" >Contact</Link>
                {/* <li className="mb-2">
                  <Link to="/flowbite" className="hover:underline">
                    Flowbite
                  </Link>
                </li>
                <li>
                  <Link to="/tailwind" className="hover:underline">
                    Tailwind CSS
                  </Link>
                </li> */}
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">
                Follow us
              </h2>
              <ul className="text-gray-500 font-medium">
                <li className="mb-2">
                  <Link to="/github" className="hover:underline">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link to="/discord" className="hover:underline">
                    Instagram
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">
                Legal
              </h2>
              <ul className="text-gray-500 font-medium">
                <li className="mb-2">
                  <Link to="/privacy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li className='mb-2'>
                  <Link to="/term-of-use" className="hover:underline">
                    Term Of Use
                  </Link>
                </li>
                <li>
                  <Link to="/deliveries-returns" className="hover:underline">
                    Delivery &amp; Returns
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />

        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center ">
            © {currentYear}{' '}
            <Link to="/" className="hover:underline">
              Voices on Canvas™
            </Link>
            . All Rights Reserved.
          </span>

          <div className="flex  mt-4 space-x-5 sm:mt-0">
            <a
              href="https://facebook.com/yourpage"
              className="text-gray-500 hover:text-gray-900"
            >
              <Facebook size={20} />
              <span className="sr-only">Facebook page</span>
            </a>

            <a
              href="https://twitter.com/yourhandle"
              className="text-gray-500 hover:text-gray-900"
            >
              <Twitter size={20} />
              <span className="sr-only">Twitter page</span>
            </a>

            <a
              href="https://dribbble.com/yourprofile"
              className="text-gray-500 hover:text-gray-900"
            >
              <Dribbble size={20} />
              <span className="sr-only">Dribbble account</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
