
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
    imageUrl: string;
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
