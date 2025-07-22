'use client';

import { Card, CardContent } from '@/components/ui/card';

const promoMessages = [
  'Free delivery on orders over INR 1000 in South Tura',
  'Free delivery on orders over INR 1000 in North Tura',
  'Free delivery on orders over INR 3000 in Tura NEHU',
  'Free delivery on orders over INR 1000 in South Tura', // Repeat first for smooth loop
];

export default function PromoCarousel() {
  return (
    <section className="mb-12">
      <Card className="bg-[#f97272] border-none shadow-none">
        <CardContent className="flex items-center justify-center p-6 h-16 md:h-auto overflow-hidden">
           <div className="h-5 overflow-hidden relative w-full text-center">
             <div className="animate-slide-up absolute inset-0 flex flex-col justify-around">
               {promoMessages.map((message, index) => (
                <span key={index} className="text-sm md:text-base font-bold text-white">
                  {message}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
