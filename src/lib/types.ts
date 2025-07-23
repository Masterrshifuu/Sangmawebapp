
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    mrp?: number;
    category: string;
    image: string;
    additionalImages: string[];
    brand?: string;
    rating?: number;
    reviewCount?: number;
    tags?: string[];
    isBestseller?: boolean;
    instantDelivery?: boolean;
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
}

export interface ShowcaseCategory {
    name: string;
    image: string;
}

export interface AIState {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    products?: Product[];
}
