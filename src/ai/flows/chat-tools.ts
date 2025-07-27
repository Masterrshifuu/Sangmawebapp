
'use server';
/**
 * @fileOverview A collection of tools that the AI chat assistant can use to interact with the application.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getProducts, getProductById } from '@/lib/products';
import { getUserData, updateUserCart, incrementUserStat } from '@/lib/user';
import { db } from '@/lib/firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { Order, CartItem, Product, UserData } from '@/lib/types';
import Fuse from 'fuse.js';

// Tool to search for products
export const searchProducts = ai.defineTool(
  {
    name: 'searchProducts',
    description: 'Search for grocery products available in the store.',
    inputSchema: z.object({
      query: z.string().describe('The user\'s search term for products (e.g., "organic milk", "apples").'),
    }),
    outputSchema: z.string().describe('A JSON string of the search results, including product names and IDs.'),
  },
  async ({ query }) => {
    const { products: allProducts, error } = await getProducts();
    if (error) {
      return JSON.stringify({ error: 'Failed to fetch products from the database.' });
    }

    const fuse = new Fuse(allProducts, {
      keys: ['name', 'category', 'tags', 'description'],
      threshold: 0.4,
    });

    const results = fuse.search(query).slice(0, 5); // Return top 5 matches
    const searchResults = results.map(r => ({
        id: r.item.id,
        name: r.item.name,
        price: r.item.mrp,
        stock: r.item.stock,
    }));

    if (searchResults.length === 0) {
        return `I couldn't find any products matching "${query}". Try searching for something else!`;
    }

    return JSON.stringify(searchResults);
  }
);

// Tool to add an item to the user's cart
export const addToCart = ai.defineTool(
    {
      name: 'addToCart',
      description: 'Adds a specified quantity of a product to the user\'s shopping cart.',
      inputSchema: z.object({
        userId: z.string().describe("The user's unique ID."),
        productId: z.string().describe('The ID of the product to add.'),
        quantity: z.number().describe('The number of units to add.'),
      }),
      outputSchema: z.string().describe('A confirmation message indicating success or failure.'),
    },
    async ({ userId, productId, quantity }) => {
        if (!userId) return "Cannot add to cart. User is not logged in.";

        const { product, error: productError } = await getProductById(productId);
        if (productError || !product) {
            return `Error: Product with ID ${productId} not found.`;
        }

        const userData = await getUserData(userId);
        const cart = userData.cart || [];

        const existingItemIndex = cart.findIndex(item => item.product.id === productId);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({ product, quantity });
        }

        await updateUserCart(userId, cart);
        return `Successfully added ${quantity} of ${product.name} to the cart.`;
    }
);

// Tool to get the contents of the cart
export const getCart = ai.defineTool(
    {
        name: 'getCart',
        description: 'Retrieves the current items in the user\'s shopping cart.',
        inputSchema: z.object({
            userId: z.string().describe("The user's unique ID."),
        }),
        outputSchema: z.string().describe("A JSON string of the user's cart contents."),
    },
    async ({ userId }) => {
        if (!userId) return "Cannot get cart. User is not logged in.";
        const userData = await getUserData(userId);
        return JSON.stringify(userData.cart || []);
    }
);

// Tool to get the user's profile information
export const getUserProfile = ai.defineTool(
    {
        name: 'getUserProfile',
        description: 'Retrieves the user\'s profile information, such as delivery address and phone number.',
        inputSchema: z.object({
            userId: z.string().describe("The user's unique ID."),
        }),
        outputSchema: z.string().describe("A JSON string of the user's profile data."),
    },
    async ({ userId }) => {
        if (!userId) return "Cannot get profile. User is not logged in.";
        const user = await getUserData(userId);
        // This is a placeholder as we don't store these on the user object yet
        const profileData = {
            deliveryAddress: "Chandmari, South Tura", // Placeholder
            phone: user.phoneNumber || null, // from firebase auth
        };
        return JSON.stringify(profileData);
    }
);


// Tool to place an order
export const placeOrder = ai.defineTool(
    {
        name: 'placeOrder',
        description: 'Places the order for the items currently in the user\'s cart.',
        inputSchema: z.object({
            userId: z.string().describe("The user's unique ID."),
            paymentMethod: z.enum(['cod', 'upi']).describe('The selected payment method.'),
        }),
        outputSchema: z.string().describe('A confirmation message about the order status.'),
    },
    async ({ userId, paymentMethod }) => {
        if (!userId) return "Cannot place order. User is not logged in.";

        const userData = await getUserData(userId);
        if (!userData.cart || userData.cart.length === 0) {
            return "Cannot place order. The cart is empty.";
        }

        const totalAmount = userData.cart.reduce((sum, item) => sum + (item.product.mrp * item.quantity), 0);
        // Note: Delivery charge calculation is omitted for simplicity in this tool.

        try {
            await runTransaction(db, async (transaction) => {
                const counterRef = doc(db, 'counters', 'orders');
                const counterDoc = await transaction.get(counterRef);
                const newOrderCount = (counterDoc.data()?.current_count || 0) + 1;
                const newOrderId = `SMM-AI-${String(newOrderCount).padStart(6, '0')}`;

                const orderData: Omit<Order, 'id' | 'createdAt'> = {
                    userId,
                    userName: 'AI Order', // Placeholder
                    userEmail: 'AI Order',
                    userPhone: 'AI Order',
                    deliveryAddress: 'To be confirmed',
                    items: userData.cart.map(item => ({
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.mrp,
                        quantity: item.quantity,
                        imageUrl: item.product.imageUrl
                    })),
                    paymentMethod,
                    status: 'Pending',
                    totalAmount,
                    active: true,
                    extraTimeInMinutes: 0,
                    extraReasons: [],
                };
                
                const newOrderRef = doc(db, 'orders', newOrderId);
                transaction.set(newOrderRef, { ...orderData, createdAt: serverTimestamp() });
                transaction.update(counterRef, { current_count: newOrderCount });
            });

            await updateUserCart(userId, []); // Clear the cart
            await incrementUserStat(userId, 'totalOrders');

            return `Order placed successfully! The order will be delivered soon. Payment method: ${paymentMethod}.`;
        } catch (error) {
            console.error("Error in placeOrder tool:", error);
            return "An error occurred while placing the order. Please try again.";
        }
    }
);
