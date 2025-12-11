# Quick Setup Guide

## Installation Steps

1. **Navigate to the admin panel directory:**
   ```bash
   cd mrenglish-admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env.local` file in the `mrenglish-admin` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Admin User

The admin panel comes with a default mock admin user:
- **Name:** Super Admin
- **Role:** super_admin
- **Email:** admin@mre.com

This is configured in:
- `lib/auth.ts` - `getCurrentAdmin()` function
- `redux/slices/userSlice.ts` - Initial state

## Backend Integration

The admin panel is configured to connect to your existing backend at `http://localhost:5000/api`. 

To integrate with your backend:

1. **Update Authentication:**
   - Modify `lib/auth.ts` to fetch admin data from your API
   - Update `lib/axiosInstance.ts` to handle JWT tokens properly

2. **Update Middleware:**
   - Modify `middleware.ts` to verify JWT tokens from cookies/headers
   - Extract admin role from the JWT token

3. **Create Admin Login:**
   - Create a login page at `app/login/page.tsx`
   - Store JWT token in localStorage or cookies
   - Update Redux state with admin data after login

## Available Routes

- `/dashboard` - Main dashboard
- `/users` - User management
- `/subscriptions` - Subscription management
- `/tickets` - Support tickets
- `/content` - Content management
- `/analytics` - Analytics dashboard
- `/marketing` - Marketing tools
- `/developer` - Developer tools
- `/settings` - Settings

## Role-Based Access

The middleware automatically protects routes based on admin roles. Users without access to a route will be redirected to `/dashboard`.

## Next Steps

1. Install dependencies and start the dev server
2. Customize the pages with actual API calls
3. Integrate with your backend authentication
4. Add more features as needed

