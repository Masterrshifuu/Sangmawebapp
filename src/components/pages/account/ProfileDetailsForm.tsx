
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { updateName } from '@/lib/account-actions';
import { Loader2 } from 'lucide-react';
import type { User } from 'firebase/auth';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export function ProfileDetailsForm({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.displayName || '',
    },
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setLoading(true);
    setError('');
    setSuccess('');
    const result = await updateName(data.name);
    if (result.success) {
        setSuccess('Profile updated successfully!');
        // This won't visually update the header immediately without a page refresh
        // or more complex state management. This is an acceptable trade-off for now.
    } else {
        setError(result.error || 'An unknown error occurred.');
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 animate-spin" />}
          Save Changes
        </Button>
        {success && <p className="text-sm text-green-600">{success}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </Form>
  );
}
