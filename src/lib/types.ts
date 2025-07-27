
import { FieldValue, Timestamp } from "firebase/firestore";

export interface Product {
    id: string;
    sku?: string;
    name: string;
    description: string;
    price: number;
    mrp?: number;
    category: string;
    imageUrl: string;
    additionalImages: string[];
    brand?: string;
    rating?: number;
    reviewCount?: number;
    tags?: string[];
    isBestseller?: boolean;
    stock: number;
    reviews?: Review[];
}

export interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface UserData {
    cart: CartItem[];
    totalOrders: number;
    totalReviews: number;
    likes: number;
    dislikes: number;
    lastLogin: FieldValue;
    loginCount: number;
}

export interface BestsellerImage {
    src: string;
    alt: string;
}
  
export interface BestsellerCategory {
    name: string;
    images: BestsellerImage[];
    totalProducts: number;
}

export interface ShowcaseCategory {
    name: string;
    imageUrls: string[];
}

export type AIState = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    products?: Product[];
    attachments?: {
        contentType: 'image' | 'video';
        url: string;
    }[];
}[];

export interface Ad {
  id:string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  link?: string;
  isActive: boolean;
  title: string;
}

export interface OrderItem {
    id: string;
    imageUrl: string;
    name: string;
    price: number;
    quantity: number;
}

export interface ExtraReason {
    addedBy: string;
    reason: string;
    minutesAdded: number;
    timestamp: Timestamp | FieldValue;
}
  
export interface Order {
    id?: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    
    // Core Order Details
    items: OrderItem[];
    totalAmount: number;
    deliveryAddress: string;
    paymentMethod: string;
    
    // Status and Tracking
    status: string; // e.g., 'Pending', 'Confirmed', 'OutForDelivery', 'Delivered', 'Cancelled', 'Scheduled'
    active: boolean; // true if order is in-progress
    
    // Timestamps
    createdAt: Timestamp | FieldValue;
    deliveryStartTime?: Timestamp | FieldValue; // Set when status becomes 'OutForDelivery'
    expectedDeliveryTime?: Timestamp | FieldValue; // deliveryStartTime + 35 min + extraTime
    
    // Delays
    extraTimeInMinutes: number;
    extraReasons: ExtraReason[];
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string; // Stored as ISO string
}
