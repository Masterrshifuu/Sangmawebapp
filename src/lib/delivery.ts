
'use client';

import type { Address } from './types';

/**
 * Calculates the delivery charge based on the order subtotal and location.
 * We only deliver to North Tura, South Tura, and Tura NEHU.
 * 
 * @param subtotal - The total price of items in the cart.
 * @param address - The user's selected delivery address object.
 * @returns The calculated delivery charge. Returns a default if address is not provided.
 */
export function calculateDeliveryCharge(subtotal: number, address: Address | null): number {
  if (!address || !address.region) {
    // If no address or region, assume a standard location for default fee calculation
    // Free delivery over ₹1000
    if (subtotal > 1000) {
      return 0;
    }
    return 50; // Default standard ₹50 fee
  }
  
  const region = address.region.toLowerCase();

  if (region.includes('tura nehu')) {
    if (subtotal > 3000) {
      return 0; // Free delivery for orders over ₹3000
    }
    return 100; // Flat ₹100 fee for Tura NEHU
  }

  if (region.includes('north tura') || region.includes('south tura')) {
    if (subtotal > 1000) {
      return 0; // Free delivery for orders over ₹1000
    }
    return 50; // Standard ₹50 fee
  }

  // Location is not serviceable - this case should ideally be handled by UI
  // but we return a default fee to prevent crashes.
  return 50;
}
