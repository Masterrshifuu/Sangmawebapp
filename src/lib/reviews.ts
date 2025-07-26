
import { db } from './firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    runTransaction,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';
import type { Review } from './types';

// Get all reviews for a specific product
export async function getReviews(productId: string): Promise<Review[]> {
    try {
        const reviewsRef = collection(db, `products/${productId}/reviews`);
        const q = query(reviewsRef, orderBy('createdAt', 'desc'));
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
    const reviewsRef = collection(db, `products/${productId}/reviews`);

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
            const timestamp = serverTimestamp();
            
            const reviewWithTimestamp = {
                ...reviewData,
                createdAt: timestamp,
            };

            transaction.set(newReviewRef, reviewWithTimestamp);

            // Prepare the review object to return
            newReview = {
                id: newReviewRef.id,
                ...reviewData,
                createdAt: new Date().toISOString() // Use current date for immediate optimistic update
            };
        });

        if (!newReview) {
            throw new Error("Transaction failed to return new review.");
        }

        return newReview;
    } catch (error) {
        console.error("Error in addReview transaction: ", error);
        throw error;
    }
}
