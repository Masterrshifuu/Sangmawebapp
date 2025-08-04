
'use client'
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { AccordionListItem, LinkListItem } from './ListItems';
import type { NavItem } from './accountNavItems';
import { useAuth } from '@/hooks/use-auth';
import { getUserData } from '@/lib/user';
import { useState, useEffect } from 'react';
import type { UserData } from '@/lib/types';


interface AccountSectionProps {
    title?: string;
    items: NavItem[];
}

// Section that uses an accordion for its items
export const AccountSection = ({ title, items }: AccountSectionProps) => {
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        if (user) {
            getUserData(user.uid).then(setUserData);
        }
    }, [user]);

    if (!user || !userData) {
        return null; // or a loading skeleton
    }

    return (
        <section>
            {title && <h2 className="text-sm font-semibold text-muted-foreground px-2 mb-2">{title}</h2>}
            <Accordion type="single" collapsible className="w-full space-y-2">
                {items.map((item, index) => (
                    <AccordionItem key={item.label} value={`item-${index}`} className="border-b-0">
                        <AccordionListItem
                            icon={item.icon}
                            label={item.label}
                            content={item.content}
                            user={user}
                            userData={userData}
                        />
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
}

// Section that renders simple links, no accordion
export const LegalSection = ({ title, items }: AccountSectionProps) => (
     <section>
        <h2 className="text-sm font-semibold text-muted-foreground px-2 mb-2">{title}</h2>
        <div className="space-y-2">
            {items.map(item => (
                <LinkListItem key={item.label} icon={item.icon} label={item.label} href={item.href} content={item.content as React.ReactNode} />
            ))}
        </div>
    </section>
);
