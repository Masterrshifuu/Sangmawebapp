

'use client';
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export const UnserviceableLocation = () => {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
            <h2 className="text-2xl font-bold">Unserviceable Location</h2>
            <p className="text-muted-foreground mt-2">We do not deliver to this location yet.</p>
            <p className="text-sm text-muted-foreground">Please try a different area or region.</p>
        </div>
    )
}
