
import type { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  bestseller: boolean;
};

export type CartItem = Product & {
  quantity: number;
};

export type Category = {
  id: string;
  name: string;
  subcategories?: string[];
};

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export type Order = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: 'COD' | 'UPI';
  status: OrderStatus;
  createdAt: Timestamp;
};


export type UserProfileData = {
  uid: string;
  email: string | null;
  phone?: string;
  address?: string;
  landmark?: string;
  region?: string;
};

export interface BestsellerImage {
  productId: string;
  imageUrl: string;
}

export interface BestsellerCategory {
  id: string;
  name: string;
  images: BestsellerImage[];
  productCount: number;
}
