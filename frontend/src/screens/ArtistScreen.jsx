import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetSellersQuery} from '../slices/usersApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ArtistPage = () => {
  const { data: artists, isLoading, error } = useGetSellersQuery();
  const [search, setSearch] = useState('');

  const filteredArtists = artists?.filter((artist) => {
    const nameMatch = artist.name?.toLowerCase().includes(search.toLowerCase());
    const locationMatch = artist.artistProfile?.location
      ?.toLowerCase()
      .includes(search.toLowerCase());
    return nameMatch || locationMatch;
  });

  return (
    <div className="px-4 md:px-8 lg:px-16 py-8  min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">🎨 Artists</h1>

      {/* 🔎 Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by artist name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg p-3 shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
        />
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : filteredArtists?.length === 0 ? (
        <p className="text-center text-gray-600">No artists match your search.</p>
      ) : (
        <div
          className="
            grid 
            grid-cols-1
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {filteredArtists.map((artist) => (
            <Link
              key={artist._id}
              to={`/artists/${artist._id}`}
              className="
                flex flex-row lg:flex-col
                items-center
                bg-white rounded-lg shadow hover:shadow-md transition p-4
              "
            >
              {/* 👤 Image */}
              <img
                src={
                  artist.artistProfile?.photo
                    ? artist.artistProfile.photo
                    : '/images/default-avatar.png'
                }
                alt={artist.name}
                className="
                  w-20 h-20 object-cover rounded-full border
                  mr-4 lg:mr-0 lg:mb-3
                "
              />
              {/* ✨ Text */}
              <div className="flex-1 lg:text-center">
                <h2 className="text-lg font-semibold text-gray-800">{artist.name}</h2>
                <p className="text-gray-500">
                  {artist.artistProfile?.location || 'Location not set'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistPage;
