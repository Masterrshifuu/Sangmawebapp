
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/use-auth';
import type { User } from 'firebase/auth';
import type { UserData } from '@/lib/types';

interface ListItemProps {
    icon: React.ElementType;
    label: string;
    content?: React.ReactNode | React.ComponentType<{ user: User, userData: UserData }>;
}

// For items that are part of an Accordion
export const AccordionListItem = ({
  icon: Icon,
  label,
  content,
  user,
  userData
}: ListItemProps & { user: User, userData: UserData }) => {
    const ContentComponent = typeof content === 'function' ? content : null;

    return (
        <>
        <AccordionTrigger className="w-full text-left p-4 bg-card rounded-lg hover:no-underline">
            <div className="flex items-center">
            <Icon className="w-6 h-6 mr-4 text-accent" />
            <span className="flex-1 font-medium text-foreground">{label}</span>
            </div>
        </AccordionTrigger>
        <AccordionContent className="p-4 text-muted-foreground bg-card rounded-b-lg -mt-2">
            {ContentComponent ? <ContentComponent user={user} userData={userData} /> : (content || 'This feature is coming soon!')}
        </AccordionContent>
        </>
    );
}

// For items that are simple links or display static text
export const LinkListItem = ({
    icon: Icon,
    label,
    href,
    content
}: {
    icon: React.ElementType;
    label: string;
    href?: string;
    content?: React.ReactNode;
}) => {
    const itemContent = (
        <div className="flex items-center p-4 bg-card rounded-lg transition-all duration-200 active:bg-accent/20">
            <Icon className="w-6 h-6 mr-4 text-accent" />
            <div className="flex-1">
                <span className="font-medium text-foreground">{label}</span>
                {content && <p className="text-sm text-muted-foreground">{content}</p>}
            </div>
            {href && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
        </div>
    );

    if (href) {
        return <Link href={href}>{itemContent}</Link>
    }

    return <div>{itemContent}</div>
}
