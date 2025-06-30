"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, CircleDot, Truck, PackageCheck, Package } from "lucide-react";

const steps = [
  { name: "Order Placed", icon: CheckCircle2 },
  { name: "Preparing", icon: Package },
  { name: "Out for Delivery", icon: Truck },
  { name: "Delivered", icon: PackageCheck },
];

type OrderStatusTrackerProps = {
  currentStep: number;
};

export default function OrderStatusTracker({ currentStep }: OrderStatusTrackerProps) {
  return (
    <div className="w-full py-4">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const stepIndex = index + 1;
          const isCompleted = currentStep > stepIndex;
          const isCurrent = currentStep === stepIndex;
          const isPending = currentStep < stepIndex;
          
          const Icon = step.icon;

          return (
            <div key={step.name} className="flex-1 flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/30",
                    isPending && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <p
                  className={cn(
                    "text-xs sm:text-sm mt-2 text-center",
                    isCurrent ? "font-bold text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1",
                    isCompleted || isCurrent ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
