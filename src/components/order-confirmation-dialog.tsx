'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle2 } from 'lucide-react';

interface OrderConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrackOrder: () => void;
  onContinueShopping: () => void;
}

export function OrderConfirmationDialog({
  open,
  onOpenChange,
  onTrackOrder,
  onContinueShopping,
}: OrderConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center items-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <AlertDialogTitle className="text-center text-2xl">Order Placed!</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Your order has been successfully placed. You can track its status or continue shopping.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2">
            <AlertDialogCancel onClick={onContinueShopping}>
              Continue Shopping
            </AlertDialogCancel>
            <AlertDialogAction onClick={onTrackOrder}>
              Track Order
            </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
