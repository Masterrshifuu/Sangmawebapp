'use client';

const STANDARD_DELIVERY_FEE = 50;

/**
 * Calculates the delivery charge based on the order subtotal and location.
 * @param subtotal - The total price of items in the cart.
 * @param location - The user's selected delivery location string.
 * @returns The calculated delivery charge.
 */
export function calculateDeliveryCharge(subtotal: number, location: string): number {
  const lowerCaseLocation = location.toLowerCase();

  if (lowerCaseLocation.includes('north tura') || lowerCaseLocation.includes('south tura')) {
    if (subtotal > 1000) {
      return 0; // Free delivery
    }
  }

  if (lowerCaseLocation.includes('tura nehu')) {
    if (subtotal > 3000) {
      return 0; // Free delivery
    }
  }
  
  return STANDARD_DELIVERY_FEE;
}
