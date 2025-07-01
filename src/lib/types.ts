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
};

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  cart?: Product[];
};
