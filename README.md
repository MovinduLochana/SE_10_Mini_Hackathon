# StallFront

Helping small businesses grow through digitalization.

## Selected Problem
Small businesses often struggle to establish an online presence because traditional e-commerce setup is expensive, time-consuming, and complicated. Many rely on manual cataloging, WhatsApp-only sales, and paper-based inventory tracking, which limits customer reach, slows order processing, and makes business growth difficult.

## Proposed Solution
StallFront is an instant digital catalog and storefront builder designed for small business owners. It allows merchants to enter basic shop and product details through a simple onboarding form and automatically generate a public storefront with a shareable link and QR code. Customers can browse products, search, and filter by category or price, while owners can update stock and manage inventory in real time.

## Main Features
- Instant storefront creation from a simple owner form
- Auto-generated public catalog page with a shareable URL and QR code
- Search and filter products by category and price range
- Inventory management with add, edit, delete, and stock update actions
- Product cards with name, price, image, description, and stock status
- AI-powered product description generation from a few keywords
- AI-assisted category suggestions for new products
- Designed to help micro and small businesses digitize quickly and affordably

## Technologies Used
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python
- Database: Supabase / PostgreSQL
- Authentication: Supabase Auth
- APIs and utility services: QR code generation, WhatsApp order link generation, live store/product APIs
- AI Integration: Google GenAI / Gemini for copy and category assistance

## AI Tools Used
- Google Gemini via Google GenAI for:
  - generating polished product descriptions from short keywords
  - suggesting the most relevant product category
  - improving product marketing copy for local buyers

## Team Member Details and Contributions
The team members can be updated with their exact names and roles as needed. The project structure currently reflects the following responsibilities:

| Student ID | Member Name | Contributions |
| --- | --- | --- |
| IT24100345 | Wijethunge H.A.M.L.T | Backend Development |
| IT24100762 | Atapattu S.K. | Backend Development |
| IT24100327 | Perera B.P.N. | Frontend Development |
| IT24103186 | Liyanasooriya B.G.S.L | Frontend Development |

## Installation and Execution Instructions
### Frontend
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   pnpm dev
   ```
4. Open the app in your browser:
   ```text
   http://localhost:3000
   ```

### Backend
1. Go to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   ```

   Windows:
   ```bash
   .venv\Scripts\activate
   ```

   macOS / Linux:
   ```bash
   source .venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your environment variables by copying the example file and filling in your keys:
   ```bash
   copy .env.example .env
   ```
   or
   ```bash
   cp .env.example .env
   ```
5. Start the backend API:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
6. API documentation is available at:
   ```text
   http://localhost:8000/docs
   ```

## Deployed Application Link
Production demo:
https://se-10-mini-hackathon.vercel.app

Storefront example:
https://se-10-mini-hackathon.vercel.app/storefront/<shop-slug>

## Project Summary
StallFront is built to help small businesses go digital quickly without requiring technical knowledge, complex setup, or high costs. By combining storefront generation, inventory management, search/filter experience, and optional AI-powered product support, it gives merchants a simple way to sell online and reach more customers.

## License
This project is developed for academic/hackathon use and can be adapted for further production deployment and customization.
