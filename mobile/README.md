# Shopora Mobile

Initial e-commerce application built with React Native + Expo + TypeScript. It maintains Shopora's minimalist visual identity: an off-white background, dark typography, white cards, subtle borders, and a focus on product imagery.

## Included Features
- Home screen with search, categories, and featured products
- Product catalog and product details
- Favorites
- Shopping cart with quantity controls and subtotal calculation
- Demo checkout with shipping address fields and Pix/credit card payment options
- User profile and bottom navigation

## Getting Started
Requires Node.js LTS.

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go or press a/i in an environment configured for Android/iOS.

## Important
The catalog uses local data and remote images for demonstration purposes. The checkout does not process payments. Before deploying to production, connect products, authentication, inventory, addresses, orders, and payments to Shopora's REST API built with Django REST Framework.
