import Link from 'next/link';
import { IntegrationsPanel } from '../../components/integrations/IntegrationsPanel';

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                🚛 Truck Repair Assistant
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/integrations" className="text-blue-600 font-medium">
                Integrations
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <IntegrationsPanel />
    </div>
  );
}
