'use client';

import { useEffect, useState } from 'react';

export function ServiceMapWrapper() {
  const [MapComponent, setMapComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Динамически импортируем компонент только на клиенте
    import('./ServiceMap').then((mod) => {
      setMapComponent(() => mod.ServiceMap);
    });
  }, []);

  if (!MapComponent) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  return <MapComponent />;
}
