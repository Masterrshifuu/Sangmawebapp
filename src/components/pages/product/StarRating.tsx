
'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating?: number;
    reviewCount?: number;
    onRatingChange?: (rating: number) => void;
    isInteractive?: boolean;
}

export const StarRating = ({ 
    rating = 4.5, 
    reviewCount = 0,
    onRatingChange,
    isInteractive = false 
}: StarRatingProps) => {
    const [hoverRating, setHoverRating] = useState(0);
    const displayRating = isInteractive ? hoverRating || rating : rating;

    return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 text-yellow-400" onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                    "w-4 h-4", 
                    i < displayRating ? 'fill-current' : 'text-gray-300',
                    isInteractive && 'cursor-pointer'
                )} 
                strokeWidth={1.5}
                onMouseEnter={isInteractive ? () => setHoverRating(i + 1) : undefined}
                onClick={isInteractive ? () => onRatingChange?.(i + 1) : undefined}
              />
            ))}
          </div>
          {!isInteractive && <span className="text-sm text-muted-foreground">({reviewCount.toLocaleString()} reviews)</span>}
        </div>
      );
};
