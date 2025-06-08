interface StorageItem<T> {
  data: T;
  timestamp: number;
  expires?: number;
}

interface DiagnosisHistory {
  id: string;
  truck: {
    make: string;
    model: string;
    year: number;
    engine: string;
  };
  symptoms: string[];
  diagnosis: string;
  timestamp: number;
  urgency: 'low' | 'medium' | 'high';
}

interface UserPreferences {
  favoriteServices: string[];
  preferredUnits: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export class LocalStorageService {
  private prefix = 'truck-repair-';

  setItem<T>(key: string, value: T, expirationHours?: number): void {
    try {
      const item: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        expires: expirationHours ? Date.now() + (expirationHours * 60 * 60 * 1000) : undefined
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      if (!itemStr) return null;

      const item: StorageItem<T> = JSON.parse(itemStr);
      
      // Check if item has expired
      if (item.expires && Date.now() > item.expires) {
        this.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // Specific methods for our app
  saveSelectedTruck(truck: any): void {
    this.setItem('selected-truck', truck);
  }

  getSelectedTruck(): any | null {
    return this.getItem('selected-truck');
  }

  saveDiagnosisHistory(diagnosis: DiagnosisHistory): void {
    const history = this.getDiagnosisHistory();
    history.unshift(diagnosis);
    // Keep only last 50 diagnoses
    this.setItem('diagnosis-history', history.slice(0, 50));
  }

  getDiagnosisHistory(): DiagnosisHistory[] {
    return this.getItem<DiagnosisHistory[]>('diagnosis-history') || [];
  }

  clearDiagnosisHistory(): void {
    this.removeItem('diagnosis-history');
  }

  saveUserPreferences(preferences: UserPreferences): void {
    this.setItem('user-preferences', preferences);
  }

  getUserPreferences(): UserPreferences {
    return this.getItem<UserPreferences>('user-preferences') || {
      favoriteServices: [],
      preferredUnits: 'imperial',
      theme: 'auto',
      language: 'en',
      notifications: true
    };
  }

  saveServiceLocations(locations: any[], expirationHours = 24): void {
    this.setItem('cached-services', locations, expirationHours);
  }

  getCachedServiceLocations(): any[] | null {
    return this.getItem<any[]>('cached-services');
  }

  saveOfflineQueue(action: string, data: any): void {
    const queue = this.getOfflineQueue();
    queue.push({
      id: Date.now().toString(),
      action,
      data,
      timestamp: Date.now(),
      synced: false
    });
    this.setItem('offline-queue', queue);
  }

  getOfflineQueue(): any[] {
    return this.getItem<any[]>('offline-queue') || [];
  }

  markQueueItemSynced(id: string): void {
    const queue = this.getOfflineQueue();
    const updatedQueue = queue.map(item => 
      item.id === id ? { ...item, synced: true } : item
    );
    this.setItem('offline-queue', updatedQueue);
  }

  clearSyncedQueueItems(): void {
    const queue = this.getOfflineQueue();
    const unsyncedItems = queue.filter(item => !item.synced);
    this.setItem('offline-queue', unsyncedItems);
  }

  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      // Estimate storage usage
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith(this.prefix)) {
          used += localStorage[key].length;
        }
      }

      // Rough estimate of available space (5MB is typical limit)
      const available = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  exportData(): string {
    try {
      const data: { [key: string]: any } = {};
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '');
          data[cleanKey] = JSON.parse(localStorage[key]);
        }
      }
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '{}';
    }
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

export const localStorageService = new LocalStorageService();
