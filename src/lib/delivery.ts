
'use client';

/**
 * Calculates the delivery charge based on the order subtotal and location.
 * We only deliver to North Tura, South Tura, and Tura NEHU.
 * 
 * @param subtotal - The total price of items in the cart.
 * @param location - The user's selected delivery location string.
 * @returns The calculated delivery charge, or null if the location is unserviceable.
 */
export function calculateDeliveryCharge(subtotal: number, location: string): number | null {
  const lowerCaseLocation = location.toLowerCase();

  if (lowerCaseLocation.includes('tura nehu')) {
    if (subtotal > 3000) {
      return 0; // Free delivery for orders over ₹3000
    }
    return 100; // Flat ₹100 fee for Tura NEHU
  }

  if (lowerCaseLocation.includes('north tura') || lowerCaseLocation.includes('south tura')) {
    if (subtotal > 1000) {
      return 0; // Free delivery for orders over ₹1000
    }
    return 50; // Standard ₹50 fee
  }

  // Location is not serviceable
  return null;
}
