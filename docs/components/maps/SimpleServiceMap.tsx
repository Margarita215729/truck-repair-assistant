'use client';

import { useState, useEffect } from 'react';

export function SimpleServiceMap() {
  const [isClient, setIsClient] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg border-2 border-gray-300 p-6">
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🗺️ Service Locator
        </h3>
        
        {location ? (
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
              <p className="text-sm text-gray-800 font-semibold mb-2">Your Location:</p>
              <p className="text-gray-900 font-bold">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-red-300 border-l-4 border-l-red-600">
                <h4 className="font-bold text-red-800 mb-2">🔧 Truck Repair</h4>
                <p className="text-sm text-gray-800 font-medium">Find certified repair shops</p>
                <button className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors font-semibold border border-red-300">
                  Search Nearby
                </button>
              </div>
              
              <div className="bg-white rounded-lg p-4 border-2 border-blue-300 border-l-4 border-l-blue-600">
                <h4 className="font-bold text-blue-800 mb-2">⛽ Truck Stops</h4>
                <p className="text-sm text-gray-800 font-medium">Fuel and amenities</p>
                <button className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors font-semibold border border-blue-300">
                  Search Nearby
                </button>
              </div>
              
              <div className="bg-white rounded-lg p-4 border-2 border-green-300 border-l-4 border-l-green-600">
                <h4 className="font-bold text-green-800 mb-2">🛠️ Parts Store</h4>
                <p className="text-sm text-gray-800 font-medium">Genuine parts and tools</p>
                <button className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors font-semibold border border-green-300">
                  Search Nearby
                </button>
              </div>
              
              <div className="bg-white rounded-lg p-4 border-2 border-orange-300 border-l-4 border-l-orange-600">
                <h4 className="font-bold text-orange-800 mb-2">🚛 Towing</h4>
                <p className="text-sm text-gray-800 font-medium">Emergency towing services</p>
                <button className="mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm hover:bg-orange-200 transition-colors font-semibold border border-orange-300">
                  Search Nearby
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
              <p className="text-sm text-yellow-900 font-medium">
                💡 <strong>Note:</strong> Interactive map with real service locations will be available soon. 
                This version shows location detection and service categories.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-800 mb-4 font-semibold">📍 Detecting your location...</p>
              <div className="animate-pulse bg-gray-300 h-4 w-48 rounded mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
