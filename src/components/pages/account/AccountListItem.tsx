
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AccordionContent, AccordionTrigger } from '@/components/ui/accordion';

export const AccountListItem = ({
  icon: Icon,
  label,
  href,
  onClick,
  content,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  content?: React.ReactNode;
}) => {
  if (href) {
    // This is for the "Legal" section items that are still links
    return (
      <Link href={href}>
        <div
          className="flex items-center p-4 bg-card rounded-lg transition-all duration-200 active:bg-accent/20"
          onClick={onClick}
        >
          <Icon className="w-6 h-6 mr-4 text-accent" />
          <span className="flex-1 font-medium text-foreground">{label}</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </Link>
    );
  }

  // This is for the accordion items
  return (
    <>
      <AccordionTrigger className="w-full text-left p-4 bg-card rounded-lg hover:no-underline">
        <div className="flex items-center">
          <Icon className="w-6 h-6 mr-4 text-accent" />
          <span className="flex-1 font-medium text-foreground">{label}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 text-muted-foreground">
        {label === 'My Orders' ? (
             <span>
                You can view all your past and current orders on the{' '}
                <Link href="/my-orders" className="text-primary underline">My Orders page</Link>.
            </span>
        ) : (
            content || 'This feature is coming soon!'
        )}
      </AccordionContent>
    </>
  );
};
