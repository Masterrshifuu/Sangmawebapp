
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CartItem } from "@/lib/types";

interface OrderSummaryProps {
    cart: CartItem[];
    totalPrice: number;
    deliveryCharge: number | null;
    finalTotal: number;
}

export const OrderSummary = ({ cart, totalPrice, deliveryCharge, finalTotal }: OrderSummaryProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                    {cart.map(item => (
                        <div key={item.product.id} className="flex justify-between">
                            <span className="text-muted-foreground flex-1 truncate pr-2">{item.product.name} x {item.quantity}</span>
                            <span>INR {(item.product.mrp * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <Separator />
                <div className="space-y-2 text-sm font-medium">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>INR {totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>{deliveryCharge === 0 ? 'FREE' : `INR ${(deliveryCharge ?? 0).toFixed(2)}`}</span>
                    </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>INR {finalTotal.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
