import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { BASE_URL } from '../constants'; // ✅ make sure this is exported as http://localhost:5001

const SearchBox = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (keyword.trim().length === 0) {
      setResults([]);
      return;
    }

    const debounce = setTimeout(async () => {
      try {
        // ✅ use BASE_URL so it calls your backend on port 5001
        const res = await fetch(`${BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}`);
        if (!res.ok) {
          console.error('Search request failed:', res.status);
          return;
        }
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [keyword]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword.trim()}`);
    } else {
      navigate('/');
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (id) => {
    navigate(`/product/${id}`);
    setKeyword('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative max-w-md mx-auto">
      <form
        onSubmit={submitHandler}
        className="flex items-center bg-[#faf2e7] border-b border-gray-400"
      >
        {/* Search Icon */}
        <button
          type="submit"
          className="p-2 hover:text-blue-600 transition"
        >
          <FaSearch className="w-5 h-5 text-black" />
        </button>

        {/* Underline input */}
        <input
          type="text"
          name="q"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder="Type your search..."
          className="flex-grow py-2 px-3 bg-transparent focus:outline-none"
        />
      </form>

      {/* Suggestions box */}
      {showSuggestions && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {results.map((product) => (
            <div
              key={product._id}
              onClick={() => handleSuggestionClick(product._id)}
              className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{product.name}</p>
                <p className="text-xs text-gray-500">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
