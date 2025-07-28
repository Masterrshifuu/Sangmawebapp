
import { db } from './firebase';
import { collection, getDocs, query, where, type Timestamp } from 'firebase/firestore';
import type { Ad } from './types';

function isTimestamp(value: any): value is Timestamp {
    return value && typeof value.toDate === 'function';
}

function processDoc(doc: any) {
    const data = doc.data();
    for (const key in data) {
        if (isTimestamp(data[key])) {
            data[key] = data[key].toDate().toISOString();
        }
    }
    return {
        id: doc.id,
        ...data
    } as Ad;
}

export async function getAds(): Promise<{ ads: Ad[], error: string | null }> {
  try {
    const adsCollection = collection(db, 'ads');
    const q = query(adsCollection, where('isActive', '==', true));
    const adsSnapshot = await getDocs(q);
    
    if (adsSnapshot.empty) {
      return { ads: [], error: null };
    }

    const adsList = adsSnapshot.docs.map(processDoc);

    return { ads: adsList, error: null };
  } catch (error: any) {
    console.error("Error fetching ads from Firestore:", error);
    let errorMessage = `Firestore error: ${error.message}.`;
    if (error.code === 'permission-denied') {
        errorMessage += ' Please check your Firestore security rules for the "ads" collection.';
    }
    return { ads: [], error: errorMessage };
  }
}
