import sequelize from '../database/config';
import { Transaction } from 'sequelize';

class DatabaseService {
  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await sequelize.authenticate();
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get database health status
   */
  async getHealthStatus(): Promise<{ connected: boolean; error?: string }> {
    try {
      await sequelize.authenticate();
      return { connected: true };
    } catch (error: any) {
      return {
        connected: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Create a new transaction
   */
  async createTransaction(): Promise<Transaction> {
    return await sequelize.transaction();
  }

  /**
   * Execute a function within a transaction
   */
  async executeInTransaction<T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    const transaction = await this.createTransaction();

    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get connection pool status
   */
  getPoolStatus(): {
    max: number;
    min: number;
    idle: number;
    acquire: number;
  } {
    const pool = sequelize.connectionManager.pool;
    
    return {
      max: pool?.max || 0,
      min: pool?.min || 0,
      idle: pool?.idle || 0,
      acquire: pool?.acquire || 0,
    };
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    await sequelize.close();
  }
}

export default new DatabaseService();
