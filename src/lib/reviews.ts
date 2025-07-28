
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
    Timestamp
} from 'firebase/firestore';
import type { Review } from './types';
import { incrementUserStat } from './user';

// Get all reviews for a specific product
export async function getReviews(productId: string): Promise<Review[]> {
    try {
        const reviewsRef = collection(db, 'reviews');
        // Query for reviews of a specific product, but don't order them here.
        const q = query(reviewsRef, where('productId', '==', productId));
        const querySnapshot = await getDocs(q);
        
        const reviews = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Ensure createdAt is a Date object for sorting
                createdAt: (data.createdAt as Timestamp).toDate(),
            } as unknown as Review & { createdAt: Date };
        });

        // Sort the reviews by date in descending order in the code.
        reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Convert Date back to ISO string for serialization
        return reviews.map(review => ({
            ...review,
            createdAt: review.createdAt.toISOString(),
        }));

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
