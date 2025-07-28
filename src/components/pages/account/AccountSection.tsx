
import { AccountListItem } from './AccountListItem';
import type { NavItem } from './accountNavItems';

interface AccountSectionProps {
    title: string;
    items: NavItem[];
}

export const AccountSection = ({ title, items }: AccountSectionProps) => (
    <section>
        <h2 className="text-sm font-semibold text-muted-foreground px-2 mb-2">{title}</h2>
        <div className="space-y-2">
            {items.map(item => <AccountListItem key={item.label} {...item} />)}
        </div>
    </section>
);
