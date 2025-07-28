
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const AccountListItem = ({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
}) => {
  const content = (
    <div
      className="flex items-center p-4 bg-card rounded-lg transition-all duration-200 active:bg-accent/20"
      onClick={onClick}
    >
      <Icon className="w-6 h-6 mr-4 text-accent" />
      <span className="flex-1 font-medium text-foreground">{label}</span>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button className="w-full text-left">{content}</button>;
};
