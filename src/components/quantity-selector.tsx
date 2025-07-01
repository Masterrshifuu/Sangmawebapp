'use client';

import { Button } from './ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuantitySelectorProps = {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: 'default' | 'small';
};

export function QuantitySelector({ quantity, onIncrease, onDecrease, size = 'default' }: QuantitySelectorProps) {
  const isSmall = size === 'small';

  return (
    <div className={cn("flex items-center justify-center rounded-md border", isSmall ? 'h-9' : 'h-10')}>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-full rounded-none rounded-l-md", isSmall ? "w-8" : "w-10")}
        onClick={onDecrease}
      >
        <Minus className={cn(isSmall ? "h-3 w-3" : "h-4 w-4")} />
      </Button>
      <span className={cn("w-8 text-center font-bold", isSmall ? "text-sm" : "text-base")}>{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-full rounded-none rounded-r-md", isSmall ? "w-8" : "w-10")}
        onClick={onIncrease}
      >
        <Plus className={cn(isSmall ? "h-3 w-3" : "h-4 w-4")} />
      </Button>
    </div>
  );
}
