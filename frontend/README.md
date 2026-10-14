# Shopora Frontend

A clean, responsive storefront built with React, TypeScript, Vite, and Lucide icons.

## Requirements

- Node.js 20+ recommended
- npm

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
npm run preview
```

## API integration

Set `VITE_API_BASE_URL` in `.env`. The API client is in `src/lib/api.ts`.
The UI currently uses local demo data so the storefront can be previewed before the Django API is fully connected. To switch product loading to the API, update `src/services/products.ts` and ensure the backend returns the expected product fields.

Expected product shape:

```json
{
  "id": 1,
  "name": "Everyday Ceramic Mug",
  "slug": "everyday-ceramic-mug",
  "description": "A considered essential for daily rituals.",
  "price": "24.00",
  "compare_at_price": null,
  "image_url": "https://example.com/product.jpg",
  "category": "Home",
  "is_featured": true
}
```

## Notes

- All source-code identifiers and UI copy are in English.
- Cart state is currently held in memory. Persist it or connect it to the backend when implementing authenticated carts.
- Checkout is a visual starter flow; payment processing must be implemented through the Django API and a payment provider.
