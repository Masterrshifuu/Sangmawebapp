
'use server';

import { auth, db } from './firebase';
import { 
    updateProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from 'firebase/auth';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Address } from './types';

export async function updateName(user: User, newName: string) {
    try {
        await updateProfile(user, { displayName: newName });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'User not logged in or email not available.' };
    }
  
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
  
    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Failed to update password. ';
      if (error.code === 'auth/wrong-password') {
        errorMessage += 'The current password you entered is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage += 'The new password is too weak.';
      } else {
        errorMessage += 'Please try again later.';
      }
      return { success: false, error: errorMessage };
    }
}

export async function updateAddresses(userId: string, addresses: Address[]) {
    try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { addresses });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
