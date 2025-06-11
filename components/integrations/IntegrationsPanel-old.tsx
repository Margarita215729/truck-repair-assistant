'use client';

import { useStainterface VehicleInfo {
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
}fect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ExternalLink, Play, DollarSign, MapPin, Wrench, AlertTriangle } from 'lucide-react';

interface APIResource {
  name: string;
  description: string;
  url: string;
  authentication: string;
  cost: string;
  features: string[];
}

interface YouTubeVideo {
  title: string;
  creator: string;
  url: string;
  duration: string;
  views: string;
  description: string;
  chapters: string[];
  verified: boolean;
  mobile: boolean;
}

interface CrossReferenceData {
  vehicleInfo: any;
  nhtsa: any;
  partsSuppliers: any[];
  serviceLocations: any[];
  diagnosticCodes: any[];
  technicalBulletins: any[];
  maintenanceSchedule: any;
}

export function IntegrationsPanel() {
  const [apis, setApis] = useState<Record<string, APIResource[]>>({});
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [crossRefData, setCrossRefData] = useState<CrossReferenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('engine');
  const [testVin, setTestVin] = useState('1FUJGHDV1FLNA1234');

  useEffect(() => {
    loadAPIs();
    loadVideos();
  }, []);

  const loadAPIs = async () => {
    try {
      const response = await fetch('/api/integrations/public-apis');
      const data = await response.json();
      if (data.success) {
        setApis(data.apis);
      }
    } catch (error) {
      console.error('Failed to load APIs:', error);
    }
  };

  const loadVideos = async () => {
    try {
      const response = await fetch(`/api/integrations/youtube-tutorials?category=${selectedCategory}`);
      const data = await response.json();
      if (data.success) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    }
  };

  const testCrossReference = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/integrations/cross-reference?vin=${testVin}`);
      const data = await response.json();
      if (data.success) {
        setCrossRefData(data.data);
      }
    } catch (error) {
      console.error('Failed to test cross-reference:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [selectedCategory]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Professional Truck Repair Integrations
        </h1>
        <p className="text-gray-600">
          Real APIs, YouTube tutorials, and cross-referenced data for professional truck diagnostics
        </p>
      </div>

      <Tabs defaultValue="apis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="apis">Public APIs</TabsTrigger>
          <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
          <TabsTrigger value="cross-ref">Cross Reference</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="apis" className="space-y-6">
          {Object.entries(apis).map(([category, apiList]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category === 'truckParts' && <Wrench className="w-5 h-5" />}
                  {category === 'serviceLocators' && <MapPin className="w-5 h-5" />}
                  {category === 'vinDecoding' && <AlertTriangle className="w-5 h-5" />}
                  {category === 'shipping' && <DollarSign className="w-5 h-5" />}
                  {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                  <Badge variant="outline">{apiList.length} APIs</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apiList.map((api, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{api.name}</h3>
                        <Button variant="outline" size="sm" asChild>
                          <a href={api.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                      
                      <p className="text-gray-600 text-sm">{api.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{api.authentication}</Badge>
                          <Badge variant="secondary">{api.cost}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {api.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Professional Repair Tutorials
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                {['engine', 'brakes', 'electrical', 'transmission', 'hydraulics', 'tires'].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm leading-tight">{video.title}</h3>
                      <Button variant="outline" size="sm" asChild>
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          <Play className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-gray-600 text-xs">by {video.creator}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary">{video.duration}</Badge>
                        <Badge variant="outline">{video.views} views</Badge>
                        {video.verified && <Badge variant="default">✓ Verified</Badge>}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-xs">{video.description}</p>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Chapters:</p>
                      <div className="flex flex-wrap gap-1">
                        {video.chapters.slice(0, 3).map((chapter, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {chapter}
                          </Badge>
                        ))}
                        {video.chapters.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{video.chapters.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cross-ref" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Referenced Data Integration</CardTitle>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={testVin}
                  onChange={(e) => setTestVin(e.target.value)}
                  placeholder="Enter VIN for testing"
                  className="px-3 py-2 border rounded-lg flex-1"
                />
                <Button onClick={testCrossReference} disabled={loading}>
                  {loading ? 'Testing...' : 'Test Integration'}
                </Button>
              </div>
            </CardHeader>
            
            {crossRefData && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vehicle Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>VIN:</strong> {crossRefData.vehicleInfo.vin}</p>
                      <p><strong>Year:</strong> {crossRefData.vehicleInfo.year}</p>
                      <p><strong>Make:</strong> {crossRefData.vehicleInfo.make}</p>
                      <p><strong>Model:</strong> {crossRefData.vehicleInfo.model}</p>
                      <p><strong>Engine:</strong> {crossRefData.vehicleInfo.engine}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Parts Availability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {crossRefData.partsSuppliers.slice(0, 2).map((supplier, idx) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-3">
                          <p className="font-medium text-sm">{supplier.name}</p>
                          <p className="text-xs text-gray-600">{supplier.estimatedPrice}</p>
                          <Badge variant={supplier.availability === 'In Stock' ? 'default' : 'secondary'} className="text-xs">
                            {supplier.availability}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Service Locations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {crossRefData.serviceLocations.slice(0, 2).map((location, idx) => (
                        <div key={idx} className="border-l-4 border-green-500 pl-3">
                          <p className="font-medium text-sm">{location.name}</p>
                          <p className="text-xs text-gray-600">{location.distance}</p>
                          <p className="text-xs text-gray-600">{location.phone}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Diagnostic Codes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {crossRefData.diagnosticCodes.map((code, idx) => (
                        <div key={idx} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">{code.code}</Badge>
                            <Badge variant={code.severity === 'Red' ? 'destructive' : 'secondary'}>
                              {code.severity}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{code.description}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Possible Causes:</p>
                            <ul className="text-xs text-gray-600 list-disc list-inside">
                              {code.possibleCauses.slice(0, 2).map((cause: string, i: number) => (
                                <li key={i}>{cause}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Implementation Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">1. API Integration Steps</h3>
                  <div className="space-y-2 text-sm">
                    <p>• Set up API keys for each service</p>
                    <p>• Implement rate limiting and caching</p>
                    <p>• Create error handling and fallbacks</p>
                    <p>• Add data validation and sanitization</p>
                    <p>• Implement real-time updates</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">2. Data Flow Architecture</h3>
                  <div className="space-y-2 text-sm">
                    <p>• VIN input triggers NHTSA lookup</p>
                    <p>• Vehicle data queries parts APIs</p>
                    <p>• Location data finds nearby services</p>
                    <p>• Cross-reference diagnostic codes</p>
                    <p>• Cache results in MongoDB</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">3. Security Considerations</h3>
                  <div className="space-y-2 text-sm">
                    <p>• Store API keys in environment variables</p>
                    <p>• Implement request signing where required</p>
                    <p>• Use HTTPS for all external requests</p>
                    <p>• Validate and sanitize all inputs</p>
                    <p>• Monitor API usage and costs</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">4. Performance Optimization</h3>
                  <div className="space-y-2 text-sm">
                    <p>• Implement aggressive caching strategies</p>
                    <p>• Use parallel API calls where possible</p>
                    <p>• Implement request deduplication</p>
                    <p>• Add graceful degradation</p>
                    <p>• Monitor response times and errors</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Ready for Production</h4>
                <p className="text-blue-800 text-sm">
                  All API endpoints are functional and ready for integration. The cross-reference system 
                  combines data from multiple sources to provide comprehensive truck diagnostic information.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
