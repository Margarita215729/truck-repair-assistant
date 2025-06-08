// Core types for the Truck Repair Assistant application

export interface Truck {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage: number;
  engineType: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  usage: 'light' | 'medium' | 'heavy';
  lastServiceDate?: string;
  owner?: string;
}

export interface MaintenanceRecord {
  id: string;
  truckId: string;
  serviceType: string;
  description?: string;
  serviceDate: string;
  mileageAtService?: number;
  cost?: number;
  serviceProvider?: string;
  nextServiceDate?: string;
  nextServiceMileage?: number;
}

export interface DiagnosticCode {
  code: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  system: 'engine' | 'transmission' | 'brake' | 'electrical' | 'exhaust' | 'other';
  possibleCauses: string[];
  recommendedActions: string[];
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  symptoms: string[];
  category: 'engine' | 'transmission' | 'brake' | 'electrical' | 'hvac' | 'suspension' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost?: {
    min: number;
    max: number;
  };
  timeToRepair?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'professional';
}

export interface RepairGuide {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  rating: number;
  thumbnail?: string;
  videoUrl?: string;
  content?: string;
}

export interface RepairStep {
  id: string;
  order: number;
  title: string;
  description: string;
  image?: string;
  video?: string;
  duration?: string;
  warnings?: string[];
}

export interface ServiceProvider {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  location: {
    lat: number;
    lon: number;
  };
  services: string[];
  specialties: string[];
  rating?: number;
  reviews?: Review[];
  hours?: BusinessHours;
  distance?: number;
  certified?: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  helpful?: number;
}

export interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  trucks: string[]; // truck IDs
  preferences: UserPreferences;
  subscription?: Subscription;
}

export interface UserPreferences {
  units: 'imperial' | 'metric';
  language: 'en' | 'es' | 'fr';
  notifications: {
    email: boolean;
    push: boolean;
    maintenance: boolean;
    recalls: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  defaultLocation?: string;
}

export interface Subscription {
  type: 'free' | 'basic' | 'pro';
  startDate: string;
  endDate?: string;
  features: string[];
  trucksLimit: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  truckId?: string;
  context?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Additional types for database integration and new features

export interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  services?: string[];
  rating: number;
  reviewCount: number;
  hours?: string;
  website?: string;
  distance?: number;
}

export interface DiagnosticSession {
  id: string;
  truckId: string;
  symptoms: string;
  aiResponse: DiagnosticResult | object;
  sessionDate: Date;
  status: string;
}

export interface ChatConversation {
  id: string;
  truckId?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

// DiagnosticResult for AI responses
export interface DiagnosticResult {
  summary: string;
  possibleIssues: Array<{
    issue: string;
    description: string;
    likelihood: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  immediateActions: string[];
  estimatedCost?: string;
}

// YouTube video result
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration?: string;
  channel?: string;
  viewCount?: number;
  publishedAt?: string;
}

// API error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Event types for analytics
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

// Form types
export interface TruckFormData {
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage: number;
  engineType: Truck['engineType'];
  transmission: Truck['transmission'];
  usage: Truck['usage'];
}

export interface IssueReportForm {
  symptoms: string;
  category: Issue['category'];
  urgency: Issue['urgency'];
  description?: string;
  truckId: string;
  images?: File[];
  audio?: Blob;
}

export interface MaintenanceForm {
  serviceType: string;
  date: string;
  mileage: number;
  description: string;
  cost?: number;
  location?: string;
  parts?: string[];
  nextServiceMileage?: number;
}

// Component props interfaces
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface TruckCardProps extends BaseComponentProps {
  truck: Truck;
  onSelect?: (truck: Truck) => void;
  onEdit?: (truck: Truck) => void;
  onDelete?: (truckId: string) => void;
}

export interface IssueCardProps extends BaseComponentProps {
  issue: Issue;
  onSelect?: (issue: Issue) => void;
  showTruck?: boolean;
}

export interface ServiceCardProps extends BaseComponentProps {
  service: ServiceProvider;
  onSelect?: (service: ServiceProvider) => void;
  onCall?: (phone: string) => void;
  onDirections?: (location: ServiceProvider['location']) => void;
}
