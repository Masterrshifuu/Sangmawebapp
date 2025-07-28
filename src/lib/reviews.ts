
'use client';

import { db } from './firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    runTransaction,
    serverTimestamp,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import type { Review } from './types';
import { incrementUserStat } from './user';

// Get all reviews for a specific product
export async function getReviews(productId: string): Promise<Review[]> {
    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('productId', '==', productId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toISOString(),
        } as Review));
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

// Add a new review and update the product's aggregate rating
export async function addReview(
    productId: string,
    reviewData: { userId: string; userName: string; rating: number; comment: string; }
): Promise<Review> {
    const productRef = doc(db, 'products', productId);
    const reviewsRef = collection(db, `reviews`);

    try {
        let newReview: Review | null = null;

        await runTransaction(db, async (transaction) => {
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
                throw new Error("Product does not exist!");
            }

            const productData = productDoc.data();
            const currentRating = productData.rating || 0;
            const currentReviewCount = productData.reviewCount || 0;

            // Calculate new average rating
            const newReviewCount = currentReviewCount + 1;
            const newRating = ((currentRating * currentReviewCount) + reviewData.rating) / newReviewCount;

            // Update product document
            transaction.update(productRef, {
                rating: newRating,
                reviewCount: newReviewCount,
            });

            // Add new review document
            const newReviewRef = doc(reviewsRef); // Create a new doc reference with a generated ID
            
            const reviewWithTimestamp = {
                ...reviewData,
                productId: productId,
                createdAt: serverTimestamp(),
            };

            transaction.set(newReviewRef, reviewWithTimestamp);

            // Prepare the review object to return
            newReview = {
                id: newReviewRef.id,
                ...reviewData,
                productId: productId,
                createdAt: new Date().toISOString() // Use current date for immediate optimistic update
            };
        });
        
        // Increment user's review count stat
        await incrementUserStat(reviewData.userId, 'totalReviews');

        if (!newReview) {
            throw new Error("Transaction failed to return new review.");
        }

        return newReview;
    } catch (error) {
        console.error("Error in addReview transaction: ", error);
        throw error;
    }
}
