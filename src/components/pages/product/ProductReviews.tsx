
import { formatDistanceToNow } from 'date-fns';
import { StarRating } from './StarRating';
import type { Review } from '@/lib/types';

export const ProductReviews = ({ reviews }: { reviews: Review[] }) => {
    if (reviews.length === 0) {
        return <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>;
    }

    return (
        <>
            {reviews.map(review => (
                <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                            {review.userName.charAt(0)}
                        </div>
                        <div className='flex-1'>
                            <p className="font-semibold text-sm">{review.userName}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                        <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm text-foreground">{review.comment}</p>
                </div>
            ))}
        </>
    );
};
