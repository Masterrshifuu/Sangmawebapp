
'use client';

import type { Address } from './types';

/**
 * Calculates the delivery charge based on the order subtotal and location.
 * We only deliver to North Tura, South Tura, and Tura NEHU.
 * 
 * @param subtotal - The total price of items in the cart.
 * @param address - The user's selected delivery address object.
 * @returns The calculated delivery charge, or null if the location is unserviceable.
 */
export function calculateDeliveryCharge(subtotal: number, address: Address | null): number | null {
  if (!address) {
    return null; // No address selected, so unserviceable
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

  // Location is not serviceable
  return null;
}
