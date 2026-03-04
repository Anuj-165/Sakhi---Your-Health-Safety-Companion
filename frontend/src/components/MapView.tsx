import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { MapPinIcon, ClockIcon, PhoneIcon } from '@heroicons/react/24/outline';
import L from 'leaflet';

// Fix for default markers in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  html: `<div class="bg-primary text-white p-2 rounded-full shadow-lg">
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`,
  className: 'custom-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

interface Chemist {
  id: string;
  name: string;
  address: string;
  phone: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  position: [number, number];
  distance: string;
}

const MapView = () => {
  const [chemists] = useState<Chemist[]>([
    {
      id: '1',
      name: 'HealthCare Pharmacy',
      address: '123 Main Street, Downtown',
      phone: '+1-234-567-8900',
      isOpen: true,
      openTime: '8:00 AM',
      closeTime: '10:00 PM',
      position: [28.6139, 77.2090],
      distance: '0.5 km',
    },
    {
      id: '2',
      name: 'Women\'s Wellness Chemist',
      address: '456 Park Avenue, Central',
      phone: '+1-234-567-8901',
      isOpen: true,
      openTime: '24/7',
      closeTime: '24/7',
      position: [28.6129, 77.2094],
      distance: '0.8 km',
    },
    {
      id: '3',
      name: 'City Medical Store',
      address: '789 Health Plaza, North',
      phone: '+1-234-567-8902',
      isOpen: false,
      openTime: '9:00 AM',
      closeTime: '9:00 PM',
      position: [28.6149, 77.2080],
      distance: '1.2 km',
    },
  ]);

  const [userLocation] = useState<[number, number]>([28.6139, 77.2090]);

  return (
    <div className="space-y-6">
      {/* Map */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <MapContainer
          center={userLocation}
          zoom={15}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location marker */}
          <Marker position={userLocation}>
            <Popup>Your Location</Popup>
          </Marker>
          
          {/* Chemist markers */}
          {chemists.map((chemist) => (
            <Marker key={chemist.id} position={chemist.position} icon={DefaultIcon}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-800">{chemist.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{chemist.address}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      chemist.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {chemist.isOpen ? 'Open' : 'Closed'}
                    </span>
                    <span className="text-sm text-gray-500">{chemist.distance}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Chemist List */}
      <div className="space-y-4">
        <h3 className="font-poppins font-semibold text-lg text-gray-800">
          Nearby Chemists
        </h3>
        
        {chemists.map((chemist) => (
          <motion.div
            key={chemist.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-poppins font-semibold text-gray-800">
                    {chemist.name}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    chemist.isOpen 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {chemist.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{chemist.address}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>
                      {chemist.openTime === '24/7' 
                        ? '24/7 Open' 
                        : `${chemist.openTime} - ${chemist.closeTime}`
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{chemist.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-primary font-semibold text-lg mb-2">
                  {chemist.distance}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-gradient text-white px-4 py-2 rounded-2xl text-sm font-medium"
                >
                  Get Directions
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MapView;