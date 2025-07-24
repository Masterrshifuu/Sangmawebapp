
'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, CheckCircle2, Circle, Package, Truck, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const TrackingTimeline = () => {
    const steps = [
        { icon: Package, title: 'Order Placed', time: '08:30 PM', completed: true },
        { icon: CheckCircle2, title: 'Order Confirmed', time: '08:31 PM', completed: true },
        { icon: Truck, title: 'Out for Delivery', time: '08:45 PM', current: true },
        { icon: Home, title: 'Delivered', time: 'Est. 09:00 PM' }
    ];

    return (
        <div className="space-y-4">
            {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            step.completed || step.current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                            <step.icon className="w-5 h-5" />
                        </div>
                        {index < steps.length - 1 && (
                            <div className={cn(
                                "w-0.5 flex-1",
                                step.completed ? "bg-primary" : "bg-muted"
                            )}></div>
                        )}
                    </div>
                    <div className="flex-1 pb-4">
                        <p className={cn(
                            "font-semibold",
                            step.completed || step.current ? "text-foreground" : "text-muted-foreground"
                        )}>{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.time}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}


const OrderSummaryCard = () => (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
        <h3 className="font-semibold mb-2">Your Order</h3>
        <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted/40">
                <Image
                    src="https://placehold.co/100x100.png"
                    data-ai-hint="fresh vegetables"
                    alt="Product"
                    fill
                    className="object-contain"
                />
            </div>
            <div className="flex-1">
                <p className="font-medium">Organic Vegetable Basket</p>
                <p className="text-sm text-muted-foreground">and 3 other items</p>
            </div>
        </div>
    </div>
)

export function TrackingSheet({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        className="h-full md:h-[80vh] flex flex-col p-0"
      >
        <DrawerHeader className="p-4 pt-4 text-center flex items-center justify-between border-b">
            <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="md:flex hidden">
                    <ChevronLeft />
                    <span className="sr-only">Back</span>
                </Button>
            </DrawerClose>
          <DrawerTitle className="flex-1 text-center">Track Your Order</DrawerTitle>
           <div className="w-10 md:block hidden" />
        </DrawerHeader>
        <main className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
                <div className="flex gap-2">
                    <Input placeholder="Enter Order ID" className="flex-1" defaultValue="SMM-84523-24"/>
                    <Button>Track</Button>
                </div>

                <div className="p-4 rounded-lg bg-accent text-accent-foreground">
                    <p className="text-sm">Estimated Delivery</p>
                    <p className="text-2xl font-bold">09:00 PM</p>
                </div>

                <TrackingTimeline />
                
                <OrderSummaryCard />

            </div>
        </main>
      </DrawerContent>
    </Drawer>
  );
}
