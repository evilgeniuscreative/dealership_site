import { RowDataPacket } from 'mysql2';
import pool from './database';
import { shuffleArray } from '../utils/visitorUtils';

/**
 * Service to handle car randomization for visitors
 */
export class CarRandomizationService {
  /**
   * Gets all car IDs from the cars_array table
   * 
   * @returns Array of car IDs
   */
  static async getAllCarIds(): Promise<number[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT c_array FROM cars_array WHERE id = 1'
      );
      
      if (rows.length === 0) {
        return [];
      }
      
      return JSON.parse(rows[0].c_array);
    } catch (error) {
      console.error('Error fetching car IDs:', error);
      return [];
    }
  }
  
  /**
   * Gets or creates a randomized car order for a specific visitor
   * 
   * @param visitorId Unique visitor identifier
   * @returns Array of car IDs in randomized order
   */
  static async getRandomizedCarOrder(visitorId: string): Promise<number[]> {
    try {
      console.log('Getting randomized car order for visitor:', visitorId);
      
      // Get all car IDs and shuffle them for this visitor
      const allCarIds = await this.getAllCarIds();
      console.log('Total car IDs found:', allCarIds.length);
      
      // Create a unique seed from the visitor ID
      const seed = visitorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      console.log('Visitor seed for randomization:', seed);
      
      // Use the seed to create a deterministic but unique shuffle for this visitor
      const shuffledCarIds = this.deterministicShuffle(allCarIds, seed);
      console.log('First 5 car IDs after shuffle:', shuffledCarIds.slice(0, 5));
      
      return shuffledCarIds;
    } catch (error) {
      console.error('Error getting randomized car order:', error);
      
      // Fallback to getting all car IDs and shuffling them randomly
      const allCarIds = await this.getAllCarIds();
      return shuffleArray(allCarIds);
    }
  }
  
  /**
   * Performs a deterministic shuffle based on a seed value
   * This ensures the same visitor always gets the same shuffle
   * but different visitors get different shuffles
   * 
   * @param array Array to shuffle
   * @param seed Seed value for randomization
   * @returns Shuffled array
   */
  private static deterministicShuffle<T>(array: T[], seed: number): T[] {
    const newArray = [...array];
    
    // Simple deterministic random number generator
    const random = (max: number) => {
      seed = (seed * 9301 + 49297) % 233280;
      return (seed / 233280) * max;
    };
    
    // Fisher-Yates shuffle with deterministic randomness
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(random(i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    
    return newArray;
  }
  
  /**
   * Updates the cars_array table when a new car is added
   * 
   * @param carId ID of the new car
   */
  static async addCarToArray(carId: number): Promise<void> {
    try {
      // Get current car IDs
      const allCarIds = await this.getAllCarIds();
      
      // Add new car ID if it doesn't exist
      if (!allCarIds.includes(carId)) {
        allCarIds.push(carId);
        
        // Update c_array
        await pool.execute(
          'UPDATE cars_array SET c_array = ? WHERE id = 1',
          [JSON.stringify(allCarIds)]
        );
        
        console.log(`Added car ID ${carId} to c_array`);
      }
    } catch (error) {
      console.error('Error adding car to array:', error);
    }
  }
}
