import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  MapIcon,
  ListBulletIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import api from '../api/axios'; // Your axios instance

interface Chemist {
  name: string;
  lat: number;
  lon: number;
  address: string;
}

const FindChemist = () => {
  const [chemists, setChemists] = useState<Chemist[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [radius, setRadius] = useState(2000); // Default 2km

  // Fetch nearby chemists based on user location
  const fetchNearbyChemists = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await api.get('/chem/nearby-chemist', {
          params: {
            lat: latitude,
            lon: longitude,
            radius: radius
          }
        });
        setChemists(response.data.nearby_chemists);
      } catch (error) {
        console.error("Failed to fetch chemists:", error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      setLoading(false);
      alert("Please enable location access to find nearby chemists.");
    });
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchNearbyChemists();
  }, [radius]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-poppins font-bold text-4xl text-gray-800 mb-4 tracking-tight">
            Find Nearby Chemist
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time pharmacy locations verified via OpenStreetMap.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <select 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-primary"
            >
              <option value={1000}>Within 1 km</option>
              <option value={2000}>Within 2 km</option>
              <option value={5000}>Within 5 km</option>
            </select>
            <button 
              onClick={fetchNearbyChemists}
              className="bg-primary-gradient text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all"
            >
              Refresh Location
            </button>
          </div>

          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-xl transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            >
              <MapIcon className="h-5 w-5" /> <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            >
              <ListBulletIcon className="h-5 w-5" /> <span>List</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Scanning local area...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {chemists.map((chemist, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <MapPinIcon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">
                      Open
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2 truncate">{chemist.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 italic">
                    {chemist.address !== "Not available" ? chemist.address : "Location details on map"}
                  </p>
                  
                  <div className="flex gap-3">
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${chemist.lat},${chemist.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Directions
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {chemists.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No pharmacies found in this range. Try increasing the search radius.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindChemist;