# Amrooz Collection - Frontend

Next.js-based frontend for the Amrooz Collection e-commerce platform.

## 🚀 Features

- **Modern E-commerce UI:** Clean, responsive design with Tailwind CSS
- **Product Catalog:** Browse products with filters and search
- **Shopping Cart:** Add to cart with quantity management
- **Checkout:** Complete checkout flow with Rs 250 delivery charge
- **Admin Dashboard:** Product and order management
- **Wishlist:** Save favorite products
- **Responsive:** Mobile-first design

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/web-braindevlop/amrooz_frontend.git
   cd amrooz_frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:3000`

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 📦 Deployment

This project uses GitHub Actions for automatic deployment to Hostinger.

### Required GitHub Secrets:

Set these in: GitHub Repository → Settings → Secrets and variables → Actions

```
SSH_HOST=145.79.30.125
SSH_USERNAME=u278943707
SSH_PASSWORD=<your-ssh-password>
SSH_PORT=65002
```

### Deployment Process:

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Automatic deployment** will trigger via GitHub Actions

3. **Monitor deployment:**
   - Go to GitHub repository → Actions tab
   - View the deployment progress

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📂 Project Structure

```
├── app/                    # Next.js 15 App Router pages
│   ├── (pages)/           # Public pages
│   ├── admin/             # Admin dashboard
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart
│   └── checkout/          # Checkout flow
├── components/            # React components
│   ├── layout/           # Layout components (Nav, Footer)
│   ├── products/         # Product-related components
│   ├── admin/            # Admin components
│   ├── home/             # Homepage components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── cart/            # Cart context & logic
│   ├── wishlist/        # Wishlist context
│   └── admin/           # Admin API calls
├── public/              # Static assets
└── styles/              # Global styles
```

## 🎨 Key Technologies

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS
- **Context API** - State management (Cart, Wishlist)
- **Fetch API** - API calls to backend

## 🔗 API Integration

The frontend connects to the backend API:

- **Production:** `https://api.amroozcollection.com`
- **Development:** `http://localhost:3001`

Set via `NEXT_PUBLIC_API_URL` environment variable.

## 🛒 Key Features

### Shopping Experience
- Product browsing with categories and tags
- Product search and filters
- Product details with variants (size, color)
- Add to cart with quantity selection
- Shopping cart management
- Wishlist functionality
- Checkout with address form
- **Rs 250 flat delivery charge**

### Admin Dashboard
- Product management (CRUD)
- Order management
- Category, tag, brand management
- Image upload for products
- Secure authentication

## 🎯 Pages

- `/` - Homepage
- `/products` - Product catalog
- `/products/[id]` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/admin` - Admin dashboard
- `/admin/login` - Admin login
- `/about`, `/contact`, `/faq` - Info pages

## 🔐 Admin Access

Default admin credentials (change after first login):
- Email: `admin@amroozcollection.com`
- Password: `Admin@123`

## 🛡️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.amroozcollection.com` |

## 📱 Responsive Design

- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface
- Fast loading with Next.js optimizations

## 📄 License

Private - Amrooz Collection

## 👥 Contact

- Email: web.brain.devlop@gmail.com
- Website: https://amroozcollection.com
