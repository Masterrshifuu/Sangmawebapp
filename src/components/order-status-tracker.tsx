"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Package, Truck, PackageCheck, XCircle, Hourglass } from "lucide-react";
import type { OrderStatus } from "@/lib/types";

const steps = [
  { name: "Confirmed", status: ["Confirmed"], icon: CheckCircle2 },
  { name: "Preparing", status: ["Shipped"], icon: Package },
  { name: "Out for Delivery", status: ["Out for Delivery"], icon: Truck },
  { name: "Delivered", status: ["Delivered"], icon: PackageCheck },
];

const getStepIndex = (status: OrderStatus): number => {
    if (status === 'Pending') return 0;
    if (status === 'Confirmed') return 1;
    if (status === 'Shipped') return 2;
    if (status === 'Out for Delivery') return 3;
    if (status === 'Delivered') return 4;
    return -1; // For cancelled or other states
}

export default function OrderStatusTracker({ status }: { status: OrderStatus }) {

  if (status === 'Cancelled') {
    return (
       <div className="w-full py-4 flex flex-col items-center justify-center text-center text-destructive">
          <XCircle className="w-12 h-12 mb-2" />
          <p className="font-bold">Order Cancelled</p>
          <p className="text-sm">This order has been cancelled.</p>
       </div>
    )
  }

  const currentStep = getStepIndex(status);

  return (
    <div className="w-full py-4">
       {status === 'Pending' && (
        <div className="flex items-center justify-center text-center text-muted-foreground mb-4 p-4 bg-muted/50 rounded-lg">
          <Hourglass className="w-6 h-6 mr-3 animate-spin" />
          <div>
            <p className="font-bold text-foreground">Order Pending</p>
            <p className="text-sm">Your order is awaiting confirmation from the store.</p>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const stepIndex = index + 1;
          const isCompleted = currentStep >= stepIndex;
          const isCurrent = currentStep === stepIndex;
          
          const Icon = step.icon;

          return (
            <div key={step.name} className="flex-1 flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
                    isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/30",
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <p
                  className={cn(
                    "text-xs sm:text-sm mt-2 text-center transition-colors duration-300",
                    isCompleted ? "font-bold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2">
                    <div className="h-full w-full bg-muted rounded-full">
                        <div
                            className={cn(
                                "h-full bg-primary rounded-full transition-all duration-500 ease-out",
                                isCompleted ? "w-full" : "w-0",
                                isCurrent && "w-1/2"
                            )}
                        />
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
