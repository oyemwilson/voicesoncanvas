import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  useGetArtistProfileQuery,
  useUpdateArtistProfileMutation,
} from '../slices/usersApiSlice';
import { useGetProductsByArtistQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import { Country, City } from 'country-state-city';

const ArtistProfileScreen = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('bio');
  const [showModal, setShowModal] = useState(false);

  // Fetch artist profile
  const { data: artist, isLoading, error, refetch } = useGetArtistProfileQuery(id);
  const [updateArtistProfile, { isLoading: updating }] = useUpdateArtistProfileMutation();

  // Fetch artworks
  const {
    data: artistProducts = [],
    isLoading: loadingArtworks,
    error: artworksError,
  } = useGetProductsByArtistQuery(id, { skip: !id });

  // Form state
  const [bio, setBio] = useState('');
  const [statement, setStatement] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [photo, setPhoto] = useState(null);

  // Country & City lists
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    // Load countries once
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    // Populate form values when artist data loads
    if (artist?.artistProfile) {
      setBio(artist.artistProfile.bio || '');
      setStatement(artist.artistProfile.artistStatement || '');
      const locParts = (artist.artistProfile.location || '').split(', ');
      if (locParts.length === 2) {
        const [countryCode, cityName] = locParts;
        setSelectedCountry(countryCode);
        setSelectedCity(cityName);
      }
    }
  }, [artist]);

  useEffect(() => {
    // When country changes, update cities list
    if (selectedCountry) {
      setCities(City.getCitiesOfCountry(selectedCountry));
      setSelectedCity('');
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedCountry]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('artistStatement', statement);
    if (selectedCountry && selectedCity) {
      formData.append('location', `${selectedCountry}, ${selectedCity}`);
    }
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      await updateArtistProfile(formData).unwrap();
      toast.success('Profile updated successfully!');
      refetch();
      setShowModal(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) return <div className="p-6">Loading artist profile…</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load artist profile.</div>;
  if (!artist) return <div className="p-6">Artist not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top profile info */}
      <div className="flex items-center space-x-6 border-b pb-6 mb-6">
        <img
          src={artist.artistProfile?.photo || '/images/default-artist.png'}
          alt={artist.name}
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div>
          <h1 className="text-3xl font-bold">{artist.name}</h1>
          <p className="text-gray-600">
            {artist.artistProfile?.location || 'Location not set'}
          </p>
        </div>
        {userInfo && userInfo._id === artist._id && artist.isSeller && (
          <button
            onClick={() => setShowModal(true)}
            className="ml-auto px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-6">
        <button
          onClick={() => setActiveTab('bio')}
          className={`pb-2 text-lg font-medium ${
            activeTab === 'bio'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Bio
        </button>
        <button
          onClick={() => setActiveTab('artworks')}
          className={`pb-2 text-lg font-medium ${
            activeTab === 'artworks'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Artwork for Sale
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'bio' ? (
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-2">About {artist.name}</h2>
          <p>{artist.artistProfile?.bio || 'This artist has not added a bio yet.'}</p>
          {artist.artistProfile?.artistStatement && (
            <>
              <h3 className="text-lg font-semibold mt-4">Artist Statement</h3>
              <p>{artist.artistProfile.artistStatement}</p>
            </>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Artworks for Sale</h2>
          {loadingArtworks ? (
            <p>Loading artworks…</p>
          ) : artworksError ? (
            <p className="text-red-600">Failed to load artworks.</p>
          ) : artistProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {artistProducts.map((art) => (
                <Product key={art._id} product={art} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No artworks available at the moment.</p>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit Your Profile</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full border rounded-md p-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Artist Statement</label>
                <textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  className="w-full border rounded-md p-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full border rounded-md p-2"
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
                <label className="block text-sm font-medium mb-1">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!cities.length}
                  className="w-full border rounded-md p-2"
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
                disabled={updating}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                {updating ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistProfileScreen;