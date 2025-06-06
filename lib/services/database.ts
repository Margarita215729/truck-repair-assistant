import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { Truck, MaintenanceRecord, ServiceLocation, DiagnosticSession, ChatConversation, ChatMessage } from '@/lib/types';

interface DbRow {
  [key: string]: unknown;
}

class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'truck_repair_assistant',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres123',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Truck operations
  async createTruck(truck: Omit<Truck, 'id'>, userId?: string): Promise<Truck> {
    const query = `
      INSERT INTO trucks (user_id, make, model, year, vin, mileage, engine_type, transmission, usage_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [userId, truck.make, truck.model, truck.year, truck.vin, truck.mileage, truck.engineType, truck.transmission, truck.usage];
    const result = await this.query(query, values);
    return this.mapTruckFromDb(result.rows[0]);
  }

  async getTrucksByUser(userId: string): Promise<Truck[]> {
    const query = 'SELECT * FROM trucks WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await this.query(query, [userId]);
    return result.rows.map(this.mapTruckFromDb);
  }

  async getTruckById(id: string): Promise<Truck | null> {
    const query = 'SELECT * FROM trucks WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows.length > 0 ? this.mapTruckFromDb(result.rows[0]) : null;
  }

  async updateTruck(id: string, updates: Partial<Truck>): Promise<Truck | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        const dbField = this.camelToSnake(key);
        fields.push(`${dbField} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    const query = `
      UPDATE trucks 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await this.query(query, values);
    return result.rows.length > 0 ? this.mapTruckFromDb(result.rows[0]) : null;
  }

  async deleteTruck(id: string): Promise<boolean> {
    const query = 'DELETE FROM trucks WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Maintenance record operations
  async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
    const query = `
      INSERT INTO maintenance_records 
      (truck_id, service_type, description, service_date, mileage_at_service, cost, service_provider, next_service_date, next_service_mileage)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      record.truckId, record.serviceType, record.description, record.serviceDate,
      record.mileageAtService, record.cost, record.serviceProvider,
      record.nextServiceDate, record.nextServiceMileage
    ];
    const result = await this.query(query, values);
    return this.mapMaintenanceRecordFromDb(result.rows[0]);
  }

  async getMaintenanceRecordsByTruck(truckId: string): Promise<MaintenanceRecord[]> {
    const query = 'SELECT * FROM maintenance_records WHERE truck_id = $1 ORDER BY service_date DESC';
    const result = await this.query(query, [truckId]);
    return result.rows.map(this.mapMaintenanceRecordFromDb);
  }

  // Service location operations
  async createServiceLocation(location: Omit<ServiceLocation, 'id'>): Promise<ServiceLocation> {
    const query = `
      INSERT INTO service_locations 
      (name, address, latitude, longitude, phone, services, rating, review_count, hours, website)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      location.name, location.address, location.latitude, location.longitude,
      location.phone, location.services, location.rating, location.reviewCount,
      location.hours, location.website
    ];
    const result = await this.query(query, values);
    return this.mapServiceLocationFromDb(result.rows[0]);
  }

  async findNearbyServiceLocations(latitude: number, longitude: number, radiusKm: number = 50): Promise<ServiceLocation[]> {
    const query = `
      SELECT *, 
        (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) AS distance
      FROM service_locations
      WHERE (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) <= $3
      ORDER BY distance
      LIMIT 20
    `;
    const result = await this.query(query, [latitude, longitude, radiusKm]);
    return result.rows.map(row => ({
      ...this.mapServiceLocationFromDb(row),
      distance: parseFloat(row.distance)
    }));
  }

  // Diagnostic session operations
  async createDiagnosticSession(session: Omit<DiagnosticSession, 'id'>): Promise<DiagnosticSession> {
    const query = `
      INSERT INTO diagnostic_sessions (truck_id, symptoms, ai_response, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [session.truckId, session.symptoms, JSON.stringify(session.aiResponse), session.status];
    const result = await this.query(query, values);
    return this.mapDiagnosticSessionFromDb(result.rows[0]);
  }

  async getDiagnosticSessionsByTruck(truckId: string): Promise<DiagnosticSession[]> {
    const query = 'SELECT * FROM diagnostic_sessions WHERE truck_id = $1 ORDER BY session_date DESC';
    const result = await this.query(query, [truckId]);
    return result.rows.map(this.mapDiagnosticSessionFromDb);
  }

  // Chat operations
  async createChatConversation(truckId?: string, title?: string): Promise<ChatConversation> {
    const query = `
      INSERT INTO chat_conversations (truck_id, title)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await this.query(query, [truckId, title]);
    return this.mapChatConversationFromDb(result.rows[0]);
  }

  async createChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const query = `
      INSERT INTO chat_messages (conversation_id, content, sender)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [message.conversationId, message.content, message.sender];
    const result = await this.query(query, values);
    return this.mapChatMessageFromDb(result.rows[0]);
  }

  async getChatMessages(conversationId: string): Promise<ChatMessage[]> {
    const query = 'SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY timestamp ASC';
    const result = await this.query(query, [conversationId]);
    return result.rows.map(this.mapChatMessageFromDb);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Utility methods
  private mapTruckFromDb(row: DbRow): Truck {
    return {
      id: row.id as string,
      make: row.make as string,
      model: row.model as string,
      year: row.year as number,
      vin: row.vin as string,
      mileage: row.mileage as number,
      engineType: row.engine_type as Truck['engineType'],
      transmission: row.transmission as Truck['transmission'],
      usage: row.usage_type as Truck['usage'],
    };
  }

  private mapMaintenanceRecordFromDb(row: DbRow): MaintenanceRecord {
    return {
      id: row.id as string,
      truckId: row.truck_id as string,
      serviceType: row.service_type as string,
      description: row.description as string,
      serviceDate: row.service_date as string,
      mileageAtService: row.mileage_at_service as number,
      cost: row.cost ? parseFloat(row.cost as string) : undefined,
      serviceProvider: row.service_provider as string,
      nextServiceDate: row.next_service_date as string,
      nextServiceMileage: row.next_service_mileage as number,
    };
  }

  private mapServiceLocationFromDb(row: DbRow): ServiceLocation {
    return {
      id: row.id as string,
      name: row.name as string,
      address: row.address as string,
      latitude: parseFloat(row.latitude as string),
      longitude: parseFloat(row.longitude as string),
      phone: row.phone as string,
      services: row.services as string[],
      rating: parseFloat(row.rating as string),
      reviewCount: row.review_count as number,
      hours: row.hours as string,
      website: row.website as string,
    };
  }

  private mapDiagnosticSessionFromDb(row: DbRow): DiagnosticSession {
    return {
      id: row.id as string,
      truckId: row.truck_id as string,
      symptoms: row.symptoms as string,
      aiResponse: row.ai_response as object,
      sessionDate: row.session_date as Date,
      status: row.status as string,
    };
  }

  private mapChatConversationFromDb(row: DbRow): ChatConversation {
    return {
      id: row.id as string,
      truckId: row.truck_id as string,
      title: row.title as string,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  }

  private mapChatMessageFromDb(row: DbRow): ChatMessage {
    return {
      id: row.id as string,
      conversationId: row.conversation_id as string,
      content: row.content as string,
      sender: row.sender as 'user' | 'assistant',
      timestamp: row.timestamp as Date,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Singleton instance
let dbInstance: DatabaseService | null = null;

export function getDatabase(): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}

export { DatabaseService };
