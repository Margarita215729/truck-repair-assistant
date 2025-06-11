'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Wrench, MapPin, Package, Youtube, DollarSign, Shield, Clock, Star, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface VehicleInfo {
  make: string;
  model: string;
  year: number;
}

interface NhtsaData {
  recalls: number;
  complaints: number;
}

interface PartsSupplier {
  name: string;
  partNumber: string;
  price: string;
  availability: string;
}

interface ServiceLocation {
  name: string;
  address: string;
  distance: string;
  rating: number;
}

interface DiagnosticCode {
  code: string;
  description: string;
  severity: string;
}

interface TechnicalBulletin {
  id: string;
  title: string;
  date: string;
}

interface MaintenanceSchedule {
  nextService: string;
  mileage: number;
}

interface IntegrationData {
  vehicleInfo: VehicleInfo;
  nhtsa: NhtsaData;
  partsSuppliers: PartsSupplier[];
  serviceLocations: ServiceLocation[];
  diagnosticCodes: DiagnosticCode[];
  technicalBulletins: TechnicalBulletin[];
  maintenanceSchedule: MaintenanceSchedule;
}

export function IntegrationsPanel() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [integrationData, setIntegrationData] = useState<IntegrationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoResults, setVideoResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const category = selectedCategory === 'all' ? 'truck repair' : selectedCategory;
      const response = await fetch(`/api/integrations/youtube?q=${encodeURIComponent(category)}&maxResults=12`);
      const data = await response.json();
      setVideoResults(data.videos || []);
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideoResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    loadVideos();
  }, [selectedCategory]);

  const mockIntegrationData: IntegrationData = {
    vehicleInfo: { make: 'Freightliner', model: 'Cascadia', year: 2019 },
    nhtsa: { recalls: 3, complaints: 12 },
    partsSuppliers: [
      { name: 'Detroit Diesel Parts', partNumber: 'DD15-123', price: '$245.99', availability: 'In Stock' },
      { name: 'Freightliner Direct', partNumber: 'FL-456', price: '$189.50', availability: 'Backordered' }
    ],
    serviceLocations: [
      { name: 'Highway Truck Service', address: '123 Industrial Blvd', distance: '2.3 miles', rating: 4.8 },
      { name: 'Big Rig Repair', address: '456 Truck Stop Way', distance: '5.1 miles', rating: 4.2 }
    ],
    diagnosticCodes: [
      { code: 'P0401', description: 'EGR Flow Insufficient', severity: 'Yellow' },
      { code: 'P1234', description: 'Turbocharger Overboost', severity: 'Red' }
    ],
    technicalBulletins: [
      { id: 'TSB-2023-001', title: 'Engine Oil Pressure Issue', date: '2023-11-15' },
      { id: 'TSB-2023-002', title: 'Transmission Shift Quality', date: '2023-10-22' }
    ],
    maintenanceSchedule: { nextService: 'A Service', mileage: 85000 }
  };

  const integrationCategories = {
    all: 'All Integrations',
    vin: 'VIN Decoding',
    parts: 'Parts Suppliers',
    service: 'Service Locators',
    diagnostics: 'Diagnostics',
    shipping: 'Shipping APIs',
    videos: 'Repair Videos'
  };

  const apiData = {
    vin: [
      {
        name: 'NHTSA VIN Decoder',
        description: 'Official vehicle information and recall data',
        url: 'https://vpic.nhtsa.dot.gov/api',
        auth: 'None (Public)',
        cost: 'Free',
        features: ['Vehicle specifications', 'Safety recalls', 'Manufacturer data']
      },
      {
        name: 'VIN Audit API',
        description: 'Commercial VIN decoding with detailed specifications',
        url: 'https://www.vinaudit.com/api',
        auth: 'API Key',
        cost: '$0.50 per lookup',
        features: ['Detailed specs', 'Market value', 'History reports']
      }
    ],
    parts: [
      {
        name: 'RockAuto Parts API',
        description: 'Comprehensive aftermarket parts catalog',
        url: 'https://www.rockauto.com/api',
        auth: 'Partner Agreement',
        cost: 'Commission based',
        features: ['Part search', 'Pricing', 'Availability', 'Images']
      },
      {
        name: 'AutoZone Commercial API',
        description: 'Professional parts and tools catalog',
        url: 'https://www.autozone.com/api',
        auth: 'B2B Account',
        cost: 'Varies by volume',
        features: ['Commercial pricing', 'Bulk ordering', 'Delivery tracking']
      }
    ],
    service: [
      {
        name: 'Google Places API',
        description: 'Find nearby truck service locations',
        url: 'https://maps.googleapis.com/maps/api/place',
        auth: 'API Key',
        cost: '$17 per 1000 requests',
        features: ['Location search', 'Reviews', 'Photos', 'Contact info']
      },
      {
        name: 'TruckStop.com API',
        description: 'Dedicated truck service and fuel locations',
        url: 'https://api.truckstop.com',
        auth: 'API Key',
        cost: 'Contact for pricing',
        features: ['Truck stops', 'Fuel prices', 'Parking', 'Services']
      }
    ],
    diagnostics: [
      {
        name: 'OBD Codes Database',
        description: 'Comprehensive diagnostic trouble code database',
        url: 'https://www.obd-codes.com/api',
        auth: 'API Key',
        cost: '$29/month',
        features: ['Code lookup', 'Descriptions', 'Repair procedures']
      }
    ],
    shipping: [
      {
        name: 'UPS API',
        description: 'Shipping rates and tracking for parts delivery',
        url: 'https://developer.ups.com',
        auth: 'OAuth',
        cost: 'Per shipment',
        features: ['Rate calculation', 'Tracking', 'Address validation']
      },
      {
        name: 'FedEx Web Services',
        description: 'Express shipping for urgent parts',
        url: 'https://developer.fedex.com',
        auth: 'API Key',
        cost: 'Per shipment',
        features: ['Express delivery', 'Tracking', 'Pickup scheduling']
      }
    ]
  };

  const renderApiCard = (api: any, index: number) => (
    <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{api.name}</span>
          <Badge variant="outline">{api.cost}</Badge>
        </CardTitle>
        <p className="text-gray-600 text-sm">{api.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Auth:</span>
            <span className="text-gray-600">{api.auth}</span>
          </div>
          
          <div className="space-y-1">
            <div className="font-medium text-sm">Features:</div>
            {api.features?.map((feature: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                <span className="text-gray-600">{feature}</span>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Documentation
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🔗 Professional Truck Service Integrations
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Access real-time data from trusted automotive APIs, parts suppliers, and service networks. 
          Build comprehensive truck maintenance solutions with verified industry data sources.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {Object.entries(integrationCategories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {(selectedCategory === 'all' || selectedCategory === 'videos') && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-600" />
            Professional Repair Video Tutorials
          </h2>
          
          <div className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for specific repair procedures..."
                className="px-3 py-2 border rounded-lg flex-1"
              />
              <Button onClick={loadVideos} disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search Videos'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoResults.map((video: any, index: number) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <Youtube className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <span>{video.channel}</span>
                    <Badge variant="secondary">{video.duration}</Badge>
                  </div>
                  <div className="space-y-2">
                    {video.chapters?.map((chapter: any, idx: number) => (
                      <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                        <span className="font-medium">{chapter.time}</span> - {chapter.title}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Watch Tutorial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {Object.entries(apiData).map(([category, apiList]) => {
        if (selectedCategory !== 'all' && selectedCategory !== category) return null;
        
        return (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              {category === 'vin' && <Truck className="w-6 h-6 text-blue-600" />}
              {category === 'parts' && <Wrench className="w-6 h-6 text-green-600" />}
              {category === 'service' && <MapPin className="w-6 h-6 text-red-600" />}
              {category === 'diagnostics' && <Shield className="w-6 h-6 text-purple-600" />}
              {category === 'shipping' && <Package className="w-6 h-6 text-orange-600" />}
              {category === 'videos' && <Youtube className="w-6 h-6 text-red-600" />}
              {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
              <Badge variant="outline">{apiList.length} APIs</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiList.map((api: any, index: number) => renderApiCard(api, index))}
            </div>
          </div>
        );
      })}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Integration Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Real-Time Data Access</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Live parts pricing and availability</li>
              <li>• Current service location hours and ratings</li>
              <li>• Up-to-date recall and safety information</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Comprehensive Coverage</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Complete vehicle specifications via VIN</li>
              <li>• Nationwide parts supplier network</li>
              <li>• Professional video tutorial library</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
