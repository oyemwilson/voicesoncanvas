import React, { useState, useEffect } from 'react';
import { useRequestSellerMutation } from '../slices/usersApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Country, City } from 'country-state-city';

const RequestSellerScreen = () => {
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState(null);
  const [artistStatement, setArtistStatement] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [requestSeller, { isLoading }] = useRequestSellerMutation();

  // Load all countries on mount
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // Update cities list whenever country changes
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
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Request to Become a Seller</h1>
      <form onSubmit={submitHandler} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block font-medium mb-1">Bio</label>
          <textarea
            className="border p-2 w-full rounded"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            className="border p-2 w-full rounded"
            onChange={(e) => setPhoto(e.target.files[0])}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Artist Statement</label>
          <textarea
            className="border p-2 w-full rounded"
            value={artistStatement}
            onChange={(e) => setArtistStatement(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="border p-2 w-full rounded"
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
          <label className="block font-medium mb-1">City</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!cities.length}
            className="border p-2 w-full rounded"
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

        <button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default RequestSellerScreen;
