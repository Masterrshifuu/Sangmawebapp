import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile - Sangma Megha Mart',
  description: 'Your user profile.',
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="https://placehold.co/100x100.png" alt="User Profile" data-ai-hint="user avatar" />
                <AvatarFallback>
                    <User className="h-12 w-12" />
                </AvatarFallback>
            </Avatar>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">This is your profile page. More features coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
