// src/pages/ShippingScreen.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Country, City } from 'country-state-city';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { saveShippingAddress } from '../slices/cartSlice';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [countryCode, setCountryCode] = useState(shippingAddress.country || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    // Save full country name, find from Country list
    const selectedCountry = Country.getAllCountries().find(c => c.isoCode === countryCode);
    dispatch(saveShippingAddress({
      address,
      city,
      postalCode,
      country: selectedCountry ? selectedCountry.name : '',
    }));
    navigate('/payment');
  };

  // Get list of countries and cities based on countryCode
  const countries = Country.getAllCountries();
  const cities = countryCode ? City.getCitiesOfCountry(countryCode) : [];

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1 className="text-2xl font-bold mb-4">Shipping</h1>
      <form onSubmit={submitHandler}>
        <div className="my-2">
          <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address</label>
          <input
            type="text"
            id="address"
            placeholder="Enter address"
            value={address}
            required
            onChange={(e) => setAddress(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="my-2">
          <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">Country</label>
          <select
            id="country"
            value={countryCode}
            required
            onChange={(e) => {
              setCountryCode(e.target.value);
              setCity(''); // reset city
            }}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="my-2">
          <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">City</label>
          <select
            id="city"
            value={city}
            required
            onChange={(e) => setCity(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            disabled={!countryCode}
          >
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="my-2">
          <label htmlFor="postalCode" className="block text-gray-700 text-sm font-bold mb-2">Postal Code</label>
          <input
            type="text"
            id="postalCode"
            placeholder="Enter postal code"
            value={postalCode}
            required
            onChange={(e) => setPostalCode(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          />
        </div>

        <button
          type="submit"
          className="bg-gray-950 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
        >
          Continue
        </button>
      </form>
    </FormContainer>
  );
};

export default ShippingScreen;