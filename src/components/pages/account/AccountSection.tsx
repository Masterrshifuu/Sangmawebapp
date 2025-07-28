
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { AccordionListItem, LinkListItem } from './ListItems';
import type { NavItem } from './accountNavItems';

interface AccountSectionProps {
    title: string;
    items: NavItem[];
}

// Section that uses an accordion for its items
export const AccountSection = ({ title, items }: AccountSectionProps) => (
    <section>
        <h2 className="text-sm font-semibold text-muted-foreground px-2 mb-2">{title}</h2>
        <Accordion type="single" collapsible className="w-full space-y-2">
            {items.map((item, index) => (
                <AccordionItem key={item.label} value={`item-${index}`} className="border-b-0">
                    <AccordionListItem {...item} />
                </AccordionItem>
            ))}
        </Accordion>
    </section>
);

// Section that renders simple links, no accordion
export const LegalSection = ({ title, items }: AccountSectionProps) => (
     <section>
        <h2 className="text-sm font-semibold text-muted-foreground px-2 mb-2">{title}</h2>
        <div className="space-y-2">
            {items.map(item => (
                <LinkListItem key={item.label} {...item} />
            ))}
        </div>
    </section>
);
