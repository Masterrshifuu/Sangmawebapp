
import {
    FileText,
    Shield,
    MapPin,
    Package,
    Headphones,
    RefreshCw,
    User,
  } from 'lucide-react';
import Link from 'next/link';

export interface NavItem {
    icon: React.ElementType;
    label: string;
    href?: string;
    onClick?: () => void;
    content?: React.ReactNode;
}
  
export const getLegalItems = (): NavItem[] => [
    { icon: FileText, label: 'Terms & Conditions', href: '/terms' },
    { icon: RefreshCw, label: 'Refund & Cancellation Policy', href: '/refund-policy' },
    { icon: Headphones, label: 'Help Center', content: 'For help, please contact us at support@sangma.com' },
];
  
export const getGeneralItems = (): NavItem[] => [
    { 
        icon: Package, 
        label: 'My Orders', 
        content: (
            <span>
                You can view all your past and current orders on the{' '}
                <Link href="/my-orders" className="text-primary underline">My Orders page</Link>.
            </span>
        )
    },
    { icon: MapPin, label: 'Address Book', content: 'You can manage your saved addresses during checkout.' },
];
  
export const getSecurityItems = (): NavItem[] => [
    { icon: User, label: 'Profile Details', content: 'Profile editing is coming soon!' },
    { icon: Shield, label: 'Change Password', content: 'You can change your password from the login screen using the "Forgot Password" link.' },
];
