
'use client';

import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  FieldValue,
} from 'firebase/firestore';
import type { UserData, CartItem, Address } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Retrieves a user's data from the 'users' collection.
 * If the user doesn't have a document, it creates one with default values.
 * @param uid The user's unique ID.
 * @returns The user's data object.
 */
export async function getUserData(uid: string): Promise<UserData> {
  const userDocRef = doc(db, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    // Ensure addresses field exists and is an array
    const data = userDocSnap.data() as UserData;
    if (!Array.isArray(data.addresses)) {
        data.addresses = [];
    }
    return data;
  } else {
    // If the document doesn't exist, create it.
    const newUserData: UserData = {
      cart: [],
      addresses: [],
      totalOrders: 0,
      totalReviews: 0,
      likes: 0,
      dislikes: 0,
      lastLogin: serverTimestamp(),
      loginCount: 1,
      phoneNumber: null,
    };
    await setDoc(userDocRef, newUserData);
    return { ...newUserData, lastLogin: newUserData.lastLogin }; // Return with FieldValue for immediate use
  }
}

/**
 * Updates the entire cart for a specific user in Firestore.
 * @param uid The user's unique ID.
 * @param cart The new cart array to be saved.
 */
export async function updateUserCart(uid: string, cart: CartItem[]): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    // Use updateDoc to only change the cart field.
    // This is safer than setDoc with merge if we only want to touch the cart.
    await updateDoc(userDocRef, { cart });
  } catch (error) {
    // If the document doesn't exist, getUserData should have created it.
    // But as a fallback, we could try creating it here.
    console.error("Error updating user cart:", error);
    // Attempt to create the document if it doesn't exist.
    const userDocSnap = await getDoc(doc(db, 'users', uid));
    if (!userDocSnap.exists()) {
        await setDoc(doc(db, 'users', uid), { cart }, { merge: true });
    }
  }
}

/**
 * Atomically increments a numeric field in the user's data document.
 * @param uid The user's unique ID.
 * @param stat The field to increment (e.g., 'totalOrders').
 * @param value The amount to increment by (defaults to 1).
 */
export async function incrementUserStat(uid: string, stat: keyof Omit<UserData, 'cart' | 'lastLogin' | 'phoneNumber' | 'addresses'>, value: number = 1): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    try {
        await updateDoc(userDocRef, {
            [stat]: increment(value)
        });
    } catch (error) {
        console.error(`Error incrementing user stat '${stat}':`, error);
        // Handle the case where the document might not exist
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            await setDoc(doc(db, 'users', uid), { [stat]: value }, { merge: true });
        }
    }
}

/**
 * Updates the user's phone number in their Firestore users document.
 * @param uid The user's unique ID.
 * @param phoneNumber The new phone number to save.
 */
export async function updateUserPhoneNumber(uid: string, phoneNumber: string): Promise<void> {
    if (!uid) throw new Error("User not found to update phone number.");
    
    try {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            phoneNumber: phoneNumber
        });
    } catch (error) {
        console.error("Error updating phone number in Firestore:", error);
        // If the document doesn't exist, create it. This is crucial for new sign-ups.
        const userDocSnap = await getDoc(doc(db, 'users', uid));
        if (!userDocSnap.exists()) {
            await setDoc(doc(db, 'users', uid), { phoneNumber }, { merge: true });
        }
    }
}

/**
 * Saves or updates a user's address in their Firestore profile.
 * This is called when an order is placed.
 * @param uid The user's unique ID.
 * @param newAddress The address object from the checkout form.
 */
export async function saveOrUpdateUserAddress(uid: string, newAddress: Address): Promise<void> {
    if (!uid) return;

    try {
        const userDocRef = doc(db, 'users', uid);
        const userData = await getUserData(uid);
        let existingAddresses = userData.addresses || [];

        // Ensure the new address has an ID.
        if (!newAddress.id) {
            newAddress.id = uuidv4();
        }

        const addressIndex = existingAddresses.findIndex(addr => addr.id === newAddress.id);

        if (addressIndex > -1) {
            // Address exists, so update it.
            existingAddresses[addressIndex] = newAddress;
        } else {
            // New address, add it to the list.
            // If it's the first address, make it the default.
            if (existingAddresses.length === 0) {
                newAddress.isDefault = true;
            }
            existingAddresses.push(newAddress);
        }

        await updateDoc(userDocRef, { addresses: existingAddresses });

    } catch (error) {
        console.error("Error saving user address:", error);
        // Don't throw, as the order itself might have been successful.
    }
}
