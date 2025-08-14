
'use client';

import type { Product, CartItem } from '@/lib/types';
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { getUserData, updateUserCart } from '@/lib/user';

type CartContextType = {
  cart: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const getLocalCart = (): CartItem[] => {
    try {
      const storedCart = localStorage.getItem('sangma-megha-mart-cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          return parsedCart;
        }
      }
      return [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  };
  
  const saveLocalCart = (cartToSave: CartItem[]) => {
      localStorage.setItem('sangma-megha-mart-cart', JSON.stringify(cartToSave));
  }

  // Effect to load cart from Firestore for logged-in users or localStorage for guests
  useEffect(() => {
    const loadCart = async () => {
        setLoading(true);
        if (user) {
            const userData = await getUserData(user.uid);
            const userCart = userData?.cart;
            setCart(Array.isArray(userCart) ? userCart : []);
        } else {
            setCart(getLocalCart());
        }
        setLoading(false);
    };

    if (!authLoading) {
        loadCart();
    }
  }, [user, authLoading]);

  // Effect to sync cart changes to Firestore or localStorage
  const syncCart = useCallback(async (updatedCart: CartItem[]) => {
    if (user) {
      await updateUserCart(user.uid, updatedCart);
    } else {
      saveLocalCart(updatedCart);
    }
  }, [user]);


  const addItem = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      let newCart;
      if (existingItem) {
        newCart = prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prevCart, { product, quantity }];
      }
      syncCart(newCart);
      return newCart;
    });
  };

  const removeItem = (productId: string) => {
    setCart((prevCart) => {
        const newCart = prevCart.filter((item) => item.product.id !== productId);
        syncCart(newCart);
        return newCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCart((prevCart) => {
        const newCart = prevCart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
        );
        syncCart(newCart);
        return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    syncCart([]);
  };

  const safeCart = Array.isArray(cart) ? cart : [];
  const totalItems = safeCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = safeCart.reduce((sum, item) => {
    const price = item.product.mrp || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
