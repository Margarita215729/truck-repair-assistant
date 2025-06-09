/**
 * Local Storage Database for Static Export
 * Provides offline-first data storage for GitHub Pages deployment
 */

// Database schema types
export interface User {
  id: string;
  email: string;
  name: string;
  subscription: string;
  createdAt: string;
}

export interface Truck {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  mileage: number;
  engineType?: string;
  transmission?: string;
  usageType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticSession {
  id: string;
  truckId?: string;
  symptoms: string;
  aiResponse: string;
  status: string;
  sessionDate: string;
}

export interface MaintenanceRecord {
  id: string;
  truckId: string;
  serviceType: string;
  description: string;
  serviceDate: string;
  mileageAtService?: number;
  cost?: number;
  serviceProvider?: string;
  nextServiceDate?: string;
  nextServiceMileage?: number;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  truckId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

export interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  services: string[];
  rating?: number;
  reviewCount?: number;
  hours?: string;
  website?: string;
}

export interface RepairGuide {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  rating?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  content?: string;
}

// Local Storage Database Class
export class LocalStorageDB {
  private static instance: LocalStorageDB;
  private isClient: boolean;

  private constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  public static getInstance(): LocalStorageDB {
    if (!LocalStorageDB.instance) {
      LocalStorageDB.instance = new LocalStorageDB();
    }
    return LocalStorageDB.instance;
  }

  // Generic storage methods
  private getItem<T>(key: string): T[] {
    if (!this.isClient) return [];
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  }

  private setItem<T>(key: string, data: T[]): void {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Users
  getUsers(): User[] {
    return this.getItem<User>('users');
  }

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    
    const users = this.getUsers();
    users.push(user);
    this.setItem('users', users);
    
    return user;
  }

  // Trucks
  getTrucks(): Truck[] {
    return this.getItem<Truck>('trucks');
  }

  getTruckById(id: string): Truck | null {
    const trucks = this.getTrucks();
    return trucks.find(truck => truck.id === id) || null;
  }

  createTruck(truckData: Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>): Truck {
    const truck: Truck = {
      ...truckData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const trucks = this.getTrucks();
    trucks.push(truck);
    this.setItem('trucks', trucks);
    
    return truck;
  }

  updateTruck(id: string, updates: Partial<Omit<Truck, 'id' | 'createdAt'>>): Truck | null {
    const trucks = this.getTrucks();
    const index = trucks.findIndex(truck => truck.id === id);
    
    if (index === -1) return null;
    
    trucks[index] = {
      ...trucks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.setItem('trucks', trucks);
    return trucks[index];
  }

  deleteTruck(id: string): boolean {
    const trucks = this.getTrucks();
    const filteredTrucks = trucks.filter(truck => truck.id !== id);
    
    if (filteredTrucks.length === trucks.length) return false;
    
    this.setItem('trucks', filteredTrucks);
    
    // Also delete related data
    this.deleteMaintenanceRecordsByTruckId(id);
    this.deleteDiagnosticSessionsByTruckId(id);
    
    return true;
  }

  // Diagnostic Sessions
  getDiagnosticSessions(): DiagnosticSession[] {
    return this.getItem<DiagnosticSession>('diagnosticSessions');
  }

  getDiagnosticSessionById(id: string): DiagnosticSession | null {
    const sessions = this.getDiagnosticSessions();
    return sessions.find(session => session.id === id) || null;
  }

  getDiagnosticSessionsByTruckId(truckId: string): DiagnosticSession[] {
    const sessions = this.getDiagnosticSessions();
    return sessions.filter(session => session.truckId === truckId);
  }

  createDiagnosticSession(sessionData: Omit<DiagnosticSession, 'id' | 'sessionDate'>): DiagnosticSession {
    const session: DiagnosticSession = {
      ...sessionData,
      id: this.generateId(),
      sessionDate: new Date().toISOString(),
    };
    
    const sessions = this.getDiagnosticSessions();
    sessions.push(session);
    this.setItem('diagnosticSessions', sessions);
    
    return session;
  }

  private deleteDiagnosticSessionsByTruckId(truckId: string): void {
    const sessions = this.getDiagnosticSessions();
    const filteredSessions = sessions.filter(session => session.truckId !== truckId);
    this.setItem('diagnosticSessions', filteredSessions);
  }

  // Maintenance Records
  getMaintenanceRecords(): MaintenanceRecord[] {
    return this.getItem<MaintenanceRecord>('maintenanceRecords');
  }

  getMaintenanceRecordsByTruckId(truckId: string): MaintenanceRecord[] {
    const records = this.getMaintenanceRecords();
    return records.filter(record => record.truckId === truckId);
  }

  createMaintenanceRecord(recordData: Omit<MaintenanceRecord, 'id' | 'createdAt'>): MaintenanceRecord {
    const record: MaintenanceRecord = {
      ...recordData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    
    const records = this.getMaintenanceRecords();
    records.push(record);
    this.setItem('maintenanceRecords', records);
    
    return record;
  }

  private deleteMaintenanceRecordsByTruckId(truckId: string): void {
    const records = this.getMaintenanceRecords();
    const filteredRecords = records.filter(record => record.truckId !== truckId);
    this.setItem('maintenanceRecords', filteredRecords);
  }

  // Chat Conversations
  getChatConversations(): ChatConversation[] {
    return this.getItem<ChatConversation>('chatConversations');
  }

  getChatConversationById(id: string): ChatConversation | null {
    const conversations = this.getChatConversations();
    return conversations.find(conv => conv.id === id) || null;
  }

  createChatConversation(convData: Omit<ChatConversation, 'id' | 'createdAt' | 'updatedAt'>): ChatConversation {
    const conversation: ChatConversation = {
      ...convData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const conversations = this.getChatConversations();
    conversations.push(conversation);
    this.setItem('chatConversations', conversations);
    
    return conversation;
  }

  // Chat Messages
  getChatMessages(): ChatMessage[] {
    return this.getItem<ChatMessage>('chatMessages');
  }

  getChatMessagesByConversationId(conversationId: string): ChatMessage[] {
    const messages = this.getChatMessages();
    return messages.filter(message => message.conversationId === conversationId);
  }

  createChatMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const message: ChatMessage = {
      ...messageData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };
    
    const messages = this.getChatMessages();
    messages.push(message);
    this.setItem('chatMessages', messages);
    
    return message;
  }

  // Service Locations (read-only, loaded from static data)
  getServiceLocations(): ServiceLocation[] {
    return this.getItem<ServiceLocation>('serviceLocations');
  }

  setServiceLocations(locations: ServiceLocation[]): void {
    this.setItem('serviceLocations', locations);
  }

  // Repair Guides (read-only, loaded from static data)
  getRepairGuides(): RepairGuide[] {
    return this.getItem<RepairGuide>('repairGuides');
  }

  setRepairGuides(guides: RepairGuide[]): void {
    this.setItem('repairGuides', guides);
  }

  // Data export/import for backup
  exportData() {
    if (!this.isClient) return null;
    
    return {
      users: this.getUsers(),
      trucks: this.getTrucks(),
      diagnosticSessions: this.getDiagnosticSessions(),
      maintenanceRecords: this.getMaintenanceRecords(),
      chatConversations: this.getChatConversations(),
      chatMessages: this.getChatMessages(),
      serviceLocations: this.getServiceLocations(),
      repairGuides: this.getRepairGuides(),
      exportDate: new Date().toISOString(),
    };
  }

  importData(data: any): boolean {
    if (!this.isClient) return false;
    
    try {
      if (data.users) this.setItem('users', data.users);
      if (data.trucks) this.setItem('trucks', data.trucks);
      if (data.diagnosticSessions) this.setItem('diagnosticSessions', data.diagnosticSessions);
      if (data.maintenanceRecords) this.setItem('maintenanceRecords', data.maintenanceRecords);
      if (data.chatConversations) this.setItem('chatConversations', data.chatConversations);
      if (data.chatMessages) this.setItem('chatMessages', data.chatMessages);
      if (data.serviceLocations) this.setItem('serviceLocations', data.serviceLocations);
      if (data.repairGuides) this.setItem('repairGuides', data.repairGuides);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    if (!this.isClient) return;
    
    const keys = [
      'users', 'trucks', 'diagnosticSessions', 'maintenanceRecords',
      'chatConversations', 'chatMessages', 'serviceLocations', 'repairGuides'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
  }
}

// Export singleton instance
export const localDB = LocalStorageDB.getInstance();
