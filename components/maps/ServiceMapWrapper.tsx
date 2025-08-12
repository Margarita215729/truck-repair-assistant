'use client';

import { useEffect, useState } from 'react';
import { MapPin, Loader2, Search, Navigation } from 'lucide-react';
import { SimpleServiceMap } from './SimpleServiceMap';

interface ServiceLocation {
  name: string;
  address: string;
  coordinates: [number, number];
  distance?: number;
  phone?: string;
  website?: string;
  rating?: number;
  openingHours?: string;
  services?: string[];
  serviceType?: string;
}

export function ServiceMapWrapper() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState('truck_repair');
  const [selectedService, setSelectedService] = useState<ServiceLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchRadius, setSearchRadius] = useState(50);
  const [addressInput, setAddressInput] = useState('');

  // Получить текущее местоположение пользователя
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to default location (center of US)
      setUserLocation({ lat: 39.8283, lng: -98.5795 });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Геокодирование адреса
  const searchByAddress = async () => {
    if (!addressInput.trim()) return;

    setIsLoadingLocation(true);
    try {
      const response = await fetch(`/api/maps/geocode?address=${encodeURIComponent(addressInput)}`);
      const data = await response.json();

      if (data.success && data.location) {
        setUserLocation(data.location);
      } else {
        alert('Address not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error searching for address.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleServiceSelect = (service: ServiceLocation) => {
    setSelectedService(service);
  };

  const handleServiceTypeChange = (serviceType: string) => {
    setSelectedServiceType(serviceType);
  };

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Service Locator</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Address Search */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Search Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Enter address or city..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && searchByAddress()}
              />
              <button
                onClick={searchByAddress}
                disabled={isLoadingLocation || !addressInput.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Current Location
            </label>
            <button
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              Use My Location
            </button>
          </div>

          {/* Search Radius */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Search Radius
            </label>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 miles</option>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
              <option value={100}>100 miles</option>
              <option value={200}>200 miles</option>
            </select>
          </div>
        </div>

        {/* Location Display */}
        {userLocation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">
                Current: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Simple Service Map Component */}
      <div className="h-[600px]">
        <SimpleServiceMap
          userLocation={userLocation}
          selectedServiceType={selectedServiceType}
          onServiceSelect={handleServiceSelect}
          onServiceTypeChange={handleServiceTypeChange}
          searchRadius={searchRadius}
          className="h-full w-full"
        />
      </div>

      {/* Selected Service Details */}
      {selectedService && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">
                {selectedServiceType === 'truck_repair' ? '🔧' : 
                 selectedServiceType === 'truck_stop' ? '⛽' :
                 selectedServiceType === 'parts_store' ? '🛍️' : '🚛'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {selectedService.name}
              </h3>
              
              {selectedService.address && (
                <p className="text-gray-600 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {selectedService.address}
                </p>
              )}

              {selectedService.distance && (
                <p className="text-blue-600 font-medium mb-2">
                  📏 {selectedService.distance.toFixed(1)} miles away
                </p>
              )}

              {selectedService.rating && (
                <p className="text-yellow-600 mb-2 flex items-center gap-1">
                  ⭐ {selectedService.rating.toFixed(1)} / 5.0
                </p>
              )}

              {selectedService.services && selectedService.services.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Services:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedService.services.map((service, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedService.phone && (
                  <a
                    href={`tel:${selectedService.phone}`}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    📞 Call Now
                  </a>
                )}
                
                <a
                  href={`https://www.google.com/maps/dir/${userLocation?.lat || 0},${userLocation?.lng || 0}/${selectedService.coordinates[0]},${selectedService.coordinates[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  🧭 Get Directions
                </a>

                {selectedService.website && (
                  <a
                    href={selectedService.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    🌐 Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
