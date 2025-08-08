import React, { useState, useEffect } from 'react';
import { useRequestSellerMutation } from '../slices/usersApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Country, City } from 'country-state-city';
import { FaCheck, FaTimes } from 'react-icons/fa';

const RequestSellerScreen = () => {
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState(null);
  const [artistStatement, setArtistStatement] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [requestSeller, { isLoading }] = useRequestSellerMutation();

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setCities(City.getCitiesOfCountry(selectedCountry));
      setSelectedCity('');
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedCountry]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast.error('Please accept the seller terms and conditions');
      return;
    }

    if (!photo) {
      toast.error('Please select a photo.');
      return;
    }

    if (!selectedCountry || !selectedCity) {
      toast.error('Please select both country and city.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('artistStatement', artistStatement);
      formData.append('location', `${selectedCountry}, ${selectedCity}`);
      formData.append('photo', photo);

      const res = await requestSeller(formData).unwrap();

      dispatch(
        setCredentials({
          ...userInfo,
          isSeller: true,
          sellerApproved: false,
        })
      );

      toast.success(res?.message || 'Your request has been submitted!');
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Seller Terms & Conditions</h3>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <p>Sellers are responsible for properly packaging and shipping artworks to the buyer's address provided at checkout.</p>
              <p>Sellers must provide valid tracking information within 48 hours of shipment.</p>
              <p>Payment to sellers will be held in escrow until 14 days after the buyer confirms receipt of the artwork or the delivery confirmation date is reached.</p>
              <p>Once the 14-day period elapses without dispute, funds will be released to the seller automatically.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTermsModal(false);
                }}
                className="bg-gray-950 hover:bg-gray-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Become a Seller</h1>
        <p className="text-gray-600 mb-6">Join our community of artists and showcase your work</p>

        <form onSubmit={submitHandler} className="space-y-6" encType="multipart/form-data">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio *</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              placeholder="Tell us about yourself and your artistic background..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo *</label>
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 border border-gray-300 px-4 py-2">
                <span>{photo ? photo.name : 'Select Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  required
                />
              </label>
              {photo && (
                <span className="ml-3 text-sm text-gray-500">
                  {photo.name}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Artist Statement *</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={4}
              value={artistStatement}
              onChange={(e) => setArtistStatement(e.target.value)}
              required
              placeholder="Describe your artistic vision and creative process..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!cities.length}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                required
              >
                <option value="">Select city</option>
                {cities.map((ct) => (
                  <option key={ct.name} value={ct.name}>
                    {ct.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms-checkbox"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  if (!termsAccepted) {
                    setShowTermsModal(true);
                  } else {
                    setTermsAccepted(false);
                  }
                }}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms-checkbox" className="font-medium text-gray-700">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-yellow-600 hover:text-yellow-500 hover:underline"
                >
                  Seller Terms & Conditions
                </button>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !termsAccepted}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-950 hover:bg-gray-600  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestSellerScreen;