
'use client';

import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { UserProfileData } from "@/lib/types";

/**
 * Retrieves a user's profile from Firestore.
 * @param uid The user's unique ID.
 * @returns The user profile data, or null if not found.
 */
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return userDoc.data() as UserProfileData;
  }
  return null;
}

/**
 * Creates or updates a user's profile in Firestore.
 * @param uid The user's unique ID.
 * @param data The profile data to save.
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfileData>): Promise<void> {
  const userDocRef = doc(db, "users", uid);
  const currentUser = auth.currentUser;

  const profileData: Partial<UserProfileData> = {
    ...data,
    uid,
    email: currentUser?.email ?? null,
  };
  
  await setDoc(userDocRef, profileData, { merge: true });
}

/**
 * Creates a user profile document if it doesn't already exist.
 * This is useful to call on user sign-up or first sign-in.
 * @param user The Firebase user object.
 */
export async function createUserProfileDocument(user: import('firebase/auth').User) {
    const userDocRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userDocRef);

    if (!snapshot.exists()) {
        const { email, phoneNumber, uid } = user;
        const createdAt = serverTimestamp();
        
        try {
            await setDoc(userDocRef, {
                uid,
                email,
                phone: phoneNumber,
                createdAt
            }, { merge: true });
        } catch (error) {
            console.error("Error creating user profile document: ", error);
        }
    }
}
