
import { FieldValue, Timestamp } from "firebase/firestore";

export interface Product {
    id: string;
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
  
export interface Order {
    id?: string;
    createdAt: Timestamp | FieldValue;
    deliveryAddress: string;
    items: OrderItem[];
    paymentMethod: string;
    status: string; // e.g., 'placed', 'confirmed', 'out_for_delivery', 'delivered'
    totalAmount: number;
    userEmail: string;
    userId: string;
    userName: string;
    userPhone: string;
    
    // Timer related fields
    estimatedDeliveryTime?: number; // in minutes, e.g., 35
    extraTime?: number; // in minutes, e.g., 5
    finalETA?: number; // e.g. 40
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string; // Stored as ISO string
}

export interface OrderTimer {
    id?: string;
    orderId: string;
    userId: string;
    orderTime: Timestamp | FieldValue;
    estimatedDeliveryTime: number; // 35
    extraTime: number; // 0 initially
    finalETA: number; // 35 initially
}
