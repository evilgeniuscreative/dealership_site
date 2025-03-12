import { Request } from 'express';
import crypto from 'crypto';

/**
 * Gets or creates a unique visitor ID from the request
 * Uses cookies to maintain visitor identity across sessions
 * 
 * @param req Express request object
 * @returns Unique visitor ID
 */
export const getVisitorId = (req: Request): string => {
  // Check if visitor already has an ID in cookies
  let visitorId = req.cookies?.visitor_id;
  
  // If no visitor ID exists, create a new one
  if (!visitorId) {
    visitorId = crypto.randomBytes(16).toString('hex');
    
    // Set cookie options - 30 day expiration
    const cookieOptions = {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const
    };
    
    // Set the cookie for future requests
    req.res?.cookie('visitor_id', visitorId, cookieOptions);
  }
  
  return visitorId;
};

/**
 * Shuffles an array using Fisher-Yates algorithm with additional randomization
 * 
 * @param array Array to shuffle
 * @returns New shuffled array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  // Create a copy to avoid modifying the original array
  const newArray = [...array];
  
  // Use current timestamp as part of the seed for better randomization
  const seed = Date.now();
  console.log('Shuffle seed:', seed);
  
  // Fisher-Yates shuffle algorithm
  for (let i = newArray.length - 1; i > 0; i--) {
    // Generate a random index using a combination of Math.random() and the seed
    const j = Math.floor((Math.random() * seed) % (i + 1));
    
    // Swap elements
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  
  // Log first few elements to verify randomization
  console.log('First 5 elements after shuffle:', newArray.slice(0, 5));
  
  return newArray;
};
