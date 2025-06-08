// Local storage utilities for offline-first approach
export interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export class LocalStorageService {
  private static readonly PREFIX = 'truck_repair_';

  static set<T>(key: string, data: T, expirationMinutes?: number): void {
    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : undefined,
      };
      
      localStorage.setItem(this.PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(this.PREFIX + key);
      if (!itemStr) return null;

      const item: StorageItem<T> = JSON.parse(itemStr);
      
      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  static getAll(): Record<string, any> {
    try {
      const result: Record<string, any> = {};
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          const cleanKey = key.replace(this.PREFIX, '');
          result[cleanKey] = this.get(cleanKey);
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error getting all from localStorage:', error);
      return {};
    }
  }

  static isExpired(key: string): boolean {
    try {
      const itemStr = localStorage.getItem(this.PREFIX + key);
      if (!itemStr) return true;

      const item: StorageItem<any> = JSON.parse(itemStr);
      return item.expiresAt ? Date.now() > item.expiresAt : false;
    } catch (error) {
      return true;
    }
  }

  static getStorageInfo(): { used: number; total: number; available: number } {
    try {
      let used = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      });

      // Estimate total storage (varies by browser, typically 5-10MB)
      const total = 5 * 1024 * 1024; // 5MB estimate
      
      return {
        used,
        total,
        available: total - used,
      };
    } catch (error) {
      return { used: 0, total: 0, available: 0 };
    }
  }
}

// Specific storage helpers for app data
export class TruckDataStorage {
  static saveTruckInfo(truckInfo: any): void {
    LocalStorageService.set('truck_info', truckInfo);
  }

  static getTruckInfo(): any | null {
    return LocalStorageService.get('truck_info');
  }

  static saveMaintenanceRecord(record: any): void {
    const records = this.getMaintenanceRecords();
    records.push({ ...record, id: Date.now().toString() });
    LocalStorageService.set('maintenance_records', records);
  }

  static getMaintenanceRecords(): any[] {
    return LocalStorageService.get('maintenance_records') || [];
  }

  static saveDiagnosisHistory(diagnosis: any): void {
    const history = this.getDiagnosisHistory();
    history.unshift({ ...diagnosis, timestamp: Date.now() });
    
    // Keep only last 50 diagnoses
    const trimmed = history.slice(0, 50);
    LocalStorageService.set('diagnosis_history', trimmed);
  }

  static getDiagnosisHistory(): any[] {
    return LocalStorageService.get('diagnosis_history') || [];
  }

  static saveSearchHistory(query: string): void {
    const history = this.getSearchHistory();
    
    // Remove if already exists
    const filtered = history.filter(item => item.query !== query);
    
    // Add to beginning
    filtered.unshift({ query, timestamp: Date.now() });
    
    // Keep only last 20 searches
    const trimmed = filtered.slice(0, 20);
    LocalStorageService.set('search_history', trimmed);
  }

  static getSearchHistory(): { query: string; timestamp: number }[] {
    return LocalStorageService.get('search_history') || [];
  }

  static saveUserPreferences(preferences: any): void {
    LocalStorageService.set('user_preferences', preferences);
  }

  static getUserPreferences(): any {
    return LocalStorageService.get('user_preferences') || {
      units: 'imperial', // imperial or metric
      language: 'en',
      notifications: true,
      theme: 'light',
    };
  }

  static cacheServiceLocations(locations: any[], location: string): void {
    LocalStorageService.set(`service_locations_${location}`, locations, 60); // Cache for 1 hour
  }

  static getCachedServiceLocations(location: string): any[] | null {
    return LocalStorageService.get(`service_locations_${location}`);
  }

  static cacheYouTubeVideos(query: string, videos: any[]): void {
    LocalStorageService.set(`youtube_${query}`, videos, 240); // Cache for 4 hours
  }

  static getCachedYouTubeVideos(query: string): any[] | null {
    return LocalStorageService.get(`youtube_${query}`);
  }
}

// Offline functionality helpers
export class OfflineService {
  static isOnline(): boolean {
    return navigator.onLine;
  }

  static onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  static saveOfflineAction(action: any): void {
    const actions = (LocalStorageService.get('offline_actions') as any[]) || [];
    actions.push({ ...action, timestamp: Date.now() });
    LocalStorageService.set('offline_actions', actions);
  }

  static getOfflineActions(): any[] {
    return (LocalStorageService.get('offline_actions') as any[]) || [];
  }

  static clearOfflineActions(): void {
    LocalStorageService.remove('offline_actions');
  }

  static syncWhenOnline(): void {
    if (this.isOnline()) {
      const actions = this.getOfflineActions();
      if (actions.length > 0) {
        console.log(`Syncing ${actions.length} offline actions...`);
        // Here you would implement actual sync logic
        this.clearOfflineActions();
      }
    }
  }
}
