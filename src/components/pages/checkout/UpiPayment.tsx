
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface UpiPaymentProps {
    paymentMethod: 'cod' | 'upi';
    canPlaceOrder: boolean;
    finalTotal: number;
    screenshotPreview: string | null;
    screenshotFile: File | null;
    handleScreenshotChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isVerifying: boolean;
}

export const UpiPayment = ({
    paymentMethod,
    canPlaceOrder,
    finalTotal,
    screenshotPreview,
    screenshotFile,
    handleScreenshotChange,
    isVerifying
}: UpiPaymentProps) => {
    return (
        <Label htmlFor="upi" className={`flex items-start gap-4 p-4 border rounded-lg has-[:checked]:bg-muted/50 has-[:checked]:border-primary ${canPlaceOrder ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
            <RadioGroupItem value="upi" id="upi" disabled={!canPlaceOrder} />
            <div className="flex-1">
                <p className="font-semibold">Pay with UPI</p>
                <p className="text-sm text-muted-foreground">Scan the QR code and upload a screenshot of your payment.</p>
                {paymentMethod === 'upi' && canPlaceOrder && (
                    <div className="mt-4 space-y-4">
                        <div className="bg-white p-2 rounded-md max-w-[200px] mx-auto">
                            <Image
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=YOUR_UPI_ID@OKBANK&pn=Sangma%20Megha%20Mart&am=${finalTotal.toFixed(2)}&cu=INR`}
                                alt="UPI QR Code"
                                width={200}
                                height={200}
                                className="w-full h-full"
                                data-ai-hint="QR code"
                            />
                        </div>
                        {screenshotPreview && (
                            <div className="mt-2 text-center">
                                <Image src={screenshotPreview} alt="Screenshot preview" width={150} height={300} className="rounded-md mx-auto border" />
                            </div>
                        )}
                        <Label htmlFor="screenshot-upload" className="w-full">
                            <div className="mt-2 flex justify-center items-center px-6 py-4 border-2 border-dashed rounded-md cursor-pointer hover:border-primary">
                                <div className="text-center">
                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {screenshotFile ? 'Change screenshot' : 'Upload payment screenshot'}
                                    </p>
                                </div>
                            </div>
                            <Input
                                id="screenshot-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleScreenshotChange}
                                disabled={isVerifying}
                            />
                        </Label>
                    </div>
                )}
            </div>
        </Label>
    )
}
