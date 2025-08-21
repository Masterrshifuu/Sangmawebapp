
import {
    ShieldCheck,
    FileText,
    CircleHelp,
    Map,
    KeyRound,
    User,
    ShieldAlert,
    FileBadge,
    Package,
    Headset
} from 'lucide-react';

import { AddressBook } from "@/components/pages/account/AddressBook";
import { ChangePasswordForm } from "@/components/pages/account/ChangePasswordForm";
import { ProfileDetailsForm } from "@/components/pages/account/ProfileDetailsForm";
import { LucideIcon } from "lucide-react";

export type LinkNavItem = {
    icon: LucideIcon;
    label: string;
    href?: string;
    isHelp?: boolean;
    helpText?: string;
};

export type NavItem = {
    icon: LucideIcon;
    label: string;
    content: React.ComponentType<any>;
};


export const myOrdersItem = {
    icon: Package,
    label: 'My Orders',
    href: '/my-orders',
};

export const getGeneralItems = () => [
    {
        icon: Map,
        label: 'Address Book',
        content: AddressBook,
    },
];

export const getSecurityItems = () => [
    {
        icon: User,
        label: 'Profile Details',
        content: ProfileDetailsForm,
    },
    {
        icon: KeyRound,
        label: 'Change Password',
        content: ChangePasswordForm,
    },
];

export const getLegalItems = () => [
    {
        icon: FileText,
        label: 'Terms & Conditions',
        href: '/terms',
    },
    {
        icon: ShieldCheck,
        label: 'Refund & Cancellation Policy',
        href: '/refund-policy',
    },
    {
        icon: FileBadge,
        label: 'Privacy & Policy',
        href: '/privacy-policy',
    },
    {
        icon: Headset,
        label: 'Help Center',
        isHelp: true,
        helpText: 'For help, please contact us at support@sangma.com'
    }
];
