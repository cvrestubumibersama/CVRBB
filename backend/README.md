# RBB Backend

Express backend for the RBB company profile app.

## Setup

1. Copy `.env.example` to `.env`
2. Adjust MySQL credentials and CORS origin
3. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Run backend:
   ```bash
   npm run dev
   ```

## API routes

- `GET /api/public/settings`
- `GET /api/public/site-texts`
- `GET /api/public/services`
- `GET /api/public/products`
- `GET /api/public/product-categories`
- `GET /api/public/projects`
- `GET /api/public/project-categories`
- `GET /api/public/legal-docs`
- `GET /api/public/partners`
- `GET /api/public/testimonials`
- `GET /api/public/advantages`
- `GET /api/public/organization-members`
- `GET /api/public/articles`
- `GET /api/public/articles/:slug`

The frontend reads data from these endpoints instead of local static files.
