import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Paginate = ({ pages, page, isAdmin = false, keyword = '' }) => {
  const { pathname } = useLocation();

  if (pages <= 1) return null;

  return (
    <div className="flex justify-center mt-4">
      <div className="flex rounded-md">
        {[...Array(pages).keys()].map((x) => {
          // Determine target URL
          let to;
          if (isAdmin) {
            to = `/admin/productlist/${x + 1}`;
          } else if (keyword) {
            to = `/search/${keyword}/page/${x + 1}`;
          } else {
            // Preserve current path and add ?page=
            to = `${pathname}?page=${x + 1}`;
          }

          return (
            <Link
              key={x + 1}
              to={to}
              className={`px-4 py-2 border border-gray-300 ${
                x + 1 === page ? 'bg-black text-white' : 'bg-white text-gray-700'
              } hover:bg-gray-100`}
            >
              {x + 1}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Paginate;
