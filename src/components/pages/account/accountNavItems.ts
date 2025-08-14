
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

import { AddressBook } from "/home/user/studio/src/components/pages/account/AddressBook";
import { ChangePasswordForm } from "/home/user/studio/src/components/pages/account/ChangePasswordForm";
import { ProfileDetailsForm } from "/home/user/studio/src/components/pages/account/ProfileDetailsForm";


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
