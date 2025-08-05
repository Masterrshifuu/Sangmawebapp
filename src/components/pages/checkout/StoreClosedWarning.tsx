
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle } from "lucide-react"

interface StoreClosedWarningProps {
    message: string;
    scheduleForNextDay: boolean;
    setScheduleForNextDay: (checked: boolean) => void;
}

export const StoreClosedWarning = ({ message, scheduleForNextDay, setScheduleForNextDay }: StoreClosedWarningProps) => {
    return (
        <Card className="border-yellow-400 bg-yellow-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle /> Store Closed
                </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700 space-y-4">
                <p>{message}</p>
                <div className="flex items-center space-x-2 p-3 bg-destructive text-destructive-foreground rounded-md">
                    <Checkbox 
                        id="schedule" 
                        checked={scheduleForNextDay} 
                        onCheckedChange={(checked) => setScheduleForNextDay(!!checked)}
                        className="border-destructive-foreground data-[state=checked]:bg-destructive-foreground data-[state=checked]:text-destructive"
                    />
                    <label htmlFor="schedule" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Yes, schedule my order for the next available slot.
                    </label>
                </div>
            </CardContent>
        </Card>
    )
}
