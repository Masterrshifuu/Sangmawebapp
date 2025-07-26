
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
  id: string;
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

    status: string;
    totalAmount: number;
    userEmail: string;
    userId: string;
    userName: string;
    userPhone: string;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string; // Stored as ISO string
}
