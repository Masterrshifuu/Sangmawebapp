
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addReview } from '@/lib/reviews';
import type { Review } from '@/lib/types';
import { StarRating } from './StarRating';

interface ReviewFormProps {
    productId: string;
    onReviewAdded: (newReview: Review) => void;
}

export const ReviewForm = ({ productId, onReviewAdded }: ReviewFormProps) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!user) {
        return <p className="text-sm text-muted-foreground">Please log in to leave a review.</p>
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            // Optionally, provide visual feedback without a toast
            console.error('Please select a rating.');
            return;
        }
        if (!comment.trim()) {
            // Optionally, provide visual feedback without a toast
            console.error('Please enter a comment.');
            return;
        }
        setIsSubmitting(true);
        try {
            const newReviewData = {
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                rating,
                comment,
            };
            const newReview = await addReview(productId, newReviewData);
            onReviewAdded(newReview);
            setRating(0);
            setComment('');
        } catch (error) {
            console.error(error);
            // Optionally, provide visual feedback without a toast
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold">Write a Review</h3>
            <div>
                <p className="text-sm font-medium mb-1">Your Rating</p>
                <StarRating rating={rating} isInteractive onRatingChange={setRating} />
            </div>
            <div>
                 <Textarea 
                    placeholder="Share your thoughts about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                 />
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
        </form>
    )
}
