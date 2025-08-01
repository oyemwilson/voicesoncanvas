// src/pages/ShopPage.jsx
import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { CurrencyContext } from '../components/CurrencyContext';
import Paginate from '../components/Paginate';

const categoryOptions = ['Abstract', 'Realism', 'Afro-Futurism', 'Contemporary', 'Traditional', 'Other'];
const mediumOptions   = [
  'Oil Painting',
  'Acrylic Painting',
  'Watercolor',
  'Digital Print',
  'Canvas Print',
  'Sculpture',
  'Mixed Media',
  'Photography',
];
const typeOptions     = [
  'Original Artwork',
  'Limited Edition Print',
  'Open Edition Print',
  'Digital Download',
  'Sculpture',
  'Mixed-Media',
];
const styleOptions    = [
  'Abstract',
  'Realism',
  'Impressionism',
  'Minimalism',
  'Afro-Futurism',
  'Pop Art',
  'Surrealism',
  'Other',
];

const ShopPage = () => {

  
  // filter state
  const [category, setCategory] = useState('');
  const [medium, setMedium]     = useState('');
  const [type, setType]         = useState('');
  const [style, setStyle]       = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [isFilterOpen, setFilterOpen] = useState(false);

  // currency & rates
  const { currency, rates } = useContext(CurrencyContext);

  // pagination from query
  const { search } = useLocation();
  const pageNumber = new URLSearchParams(search).get('page') || '1';

  // fetch products
  const { data, isLoading, error } = useGetProductsQuery({ pageNumber });
  const products = data?.products || [];

  // convert price filters back to base currency
  const rate   = rates[currency] ?? 1;
  const baseMin = priceMin === '' ? 0 : Number(priceMin) / rate;
  const baseMax = priceMax === '' ? Infinity : Number(priceMax) / rate;

  // filter logic
  const filteredProducts = products.filter((p) => {
    return (
      (!category || p.category === category) &&
      (!medium   || p.medium === medium) &&
      (!type     || p.type === type) &&
      (!style    || p.style === style) &&
      p.price >= baseMin &&
      p.price <= baseMax
    );
  });

  const resetFilters = () => {
    setCategory('');
    setMedium('');
    setType('');
    setStyle('');
    setPriceMin('');
    setPriceMax('');
  };

  const isFiltering =
    !!category || !!medium || !!type || !!style ||
    priceMin !== '' || priceMax !== '';

  // render a single dropdown given label, value, setter, options
  const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded p-2 w-full text-sm"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="relative">
      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
          onClick={() => setFilterOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out xl:hidden ${
          isFilterOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button
              onClick={() => setFilterOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <FilterSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={categoryOptions}
          />
          <FilterSelect
            label="Medium"
            value={medium}
            onChange={setMedium}
            options={mediumOptions}
          />
          <FilterSelect
            label="Type"
            value={type}
            onChange={setType}
            options={typeOptions}
          />
          <FilterSelect
            label="Style"
            value={style}
            onChange={setStyle}
            options={styleOptions}
          />

          {/* Price Range */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Price Range ({currency})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="border rounded p-2 w-full text-sm"
              />
              <span className="text-sm">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="border rounded p-2 w-full text-sm"
              />
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="bg-gray-100 hover:bg-gray-200 w-full py-2 rounded text-sm"
          >
            Reset Filters
          </button>
        </div>
      </aside>

      <div className="flex flex-col xl:flex-row gap-6 p-4">
        {/* Desktop Sidebar */}
        <aside className="hidden xl:block xl:w-1/5 bg-white rounded shadow p-4 sticky top-4 self-start">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <FilterSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={categoryOptions}
          />
          <FilterSelect
            label="Medium"
            value={medium}
            onChange={setMedium}
            options={mediumOptions}
          />
          <FilterSelect
            label="Type"
            value={type}
            onChange={setType}
            options={typeOptions}
          />
          <FilterSelect
            label="Style"
            value={style}
            onChange={setStyle}
            options={styleOptions}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Price Range ({currency})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="border rounded p-1 w-full"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="border rounded p-1 w-full"
              />
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="bg-gray-100 hover:bg-gray-200 w-full py-2 rounded mt-2"
          >
            Reset Filters
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">🛍️ Shop</h1>
            <button
              onClick={() => setFilterOpen(true)}
              className="xl:hidden text-gray-700 hover:text-gray-900 underline"
            >
              Filters
            </button>
          </div>

          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">
              {error?.data?.message || error.error}
            </Message>
          ) : filteredProducts.length === 0 ? (
            <Message>No products found.</Message>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <Product key={p._id} product={p} />
                ))}
              </div>

              {/* Pagination */}
            {/* Pagination: only when not filtering */}
            {!isFiltering && (
              <div className="mt-8 flex justify-start">
                <Paginate
                  pages={data.pages}
                  page={data.page}
                  useQueryParam={true}
                />
              </div>
            )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShopPage;
