export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  bestseller: boolean;
};

export type Category = {
  name: string;
};

export const categories: Category[] = [
  { name: "Vegetables" },
  { name: "Fruits" },
  { name: "Dairy & Eggs" },
  { name: "Bakery" },
  { name: "Meat & Fish" },
  { name: "Beverages" },
];

export const products: Product[] = [
  // Vegetables
  {
    id: "prod-1",
    name: "Fresh Tomatoes",
    description: "Juicy, red tomatoes, perfect for salads and cooking.",
    price: 50.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Vegetables",
    bestseller: true,
  },
  {
    id: "prod-2",
    name: "Crisp Onions",
    description: "Locally sourced onions, essential for any kitchen.",
    price: 40.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Vegetables",
    bestseller: false,
  },
  {
    id: "prod-3",
    name: "Organic Spinach",
    description: "Fresh and tender spinach leaves, packed with nutrients.",
    price: 30.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Vegetables",
    bestseller: true,
  },
  {
    id: "prod-4",
    name: "Local Potatoes",
    description: "Versatile potatoes, great for frying, boiling, or baking.",
    price: 35.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Vegetables",
    bestseller: false,
  },
  {
    id: "prod-5",
    name: "Crunchy Carrots",
    description: "Sweet and crunchy carrots, rich in Vitamin A.",
    price: 45.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Vegetables",
    bestseller: false,
  },
  // Fruits
  {
    id: "prod-6",
    name: "Hill Pineapples",
    description: "Sweet and tangy pineapples from the Meghalayan hills.",
    price: 80.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Fruits",
    bestseller: true,
  },
  {
    id: "prod-7",
    name: "Seasonal Oranges",
    description: "Juicy oranges, a great source of Vitamin C.",
    price: 120.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Fruits",
    bestseller: false,
  },
  {
    id: "prod-8",
    name: "Fresh Bananas",
    description: "Ripe and ready-to-eat bananas.",
    price: 60.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Fruits",
    bestseller: true,
  },
   // Dairy & Eggs
  {
    id: "prod-9",
    name: "Fresh Milk",
    description: "1L carton of fresh pasteurized milk.",
    price: 65.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Dairy & Eggs",
    bestseller: true,
  },
  {
    id: "prod-10",
    name: "Farm Fresh Eggs",
    description: "A dozen of nutritious farm fresh eggs.",
    price: 90.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Dairy & Eggs",
    bestseller: false,
  },
   // Bakery
  {
    id: "prod-11",
    name: "Brown Bread",
    description: "A loaf of freshly baked whole wheat bread.",
    price: 45.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Bakery",
    bestseller: false,
  },
  // Meat & Fish
  {
    id: "prod-12",
    name: "Fresh Chicken",
    description: "1kg of fresh, cleaned chicken curry cut.",
    price: 280.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Meat & Fish",
    bestseller: true,
  },
  // Beverages
   {
    id: "prod-13",
    name: "Local Orange Juice",
    description: "1L bottle of fresh orange juice.",
    price: 150.0,
    imageUrl: "https://placehold.co/300x300.png",
    category: "Beverages",
    bestseller: false,
  },
];
