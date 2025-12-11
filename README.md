# MR English Admin Panel

A comprehensive admin panel built with Next.js 14 (App Router), TypeScript, TailwindCSS, ShadCN UI, and Redux Toolkit.

## Features

- 🎨 Modern UI with ShadCN components
- 🔐 Role-based access control
- 📱 Responsive design with collapsible sidebar
- 🗂️ Redux Toolkit for state management
- 🔒 Route protection middleware
- 📊 Dashboard with key metrics
- 👥 User management
- 💳 Subscription management
- 🎫 Support ticket system
- 📝 Content management
- 📈 Analytics dashboard
- 📢 Marketing tools
- ⚙️ Developer tools
- 🔧 Settings management

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **ShadCN UI**
- **Redux Toolkit**
- **Axios**
- **Lucide React** (Icons)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mrenglish-admin/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Dashboard page
│   ├── users/              # Users management
│   ├── subscriptions/      # Subscription management
│   ├── tickets/            # Support tickets
│   ├── content/            # Content management
│   ├── analytics/          # Analytics dashboard
│   ├── marketing/          # Marketing tools
│   ├── developer/          # Developer tools
│   ├── settings/           # Settings
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects to dashboard)
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # ShadCN UI components
│   ├── Sidebar.tsx         # Sidebar navigation
│   ├── Navbar.tsx          # Top navigation bar
│   └── DataTable.tsx       # Reusable data table
├── lib/                    # Utility functions
│   ├── auth.ts             # Authentication helpers
│   ├── axiosInstance.ts    # Axios configuration
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
├── redux/                  # Redux store
│   ├── store.ts            # Redux store configuration
│   ├── hooks.ts            # Typed Redux hooks
│   └── slices/
│       └── userSlice.ts    # User state slice
└── middleware.ts           # Route protection middleware
```

## Role-Based Access Control

The admin panel supports multiple roles with different permissions:

- **super_admin**: Full access to all routes
- **admin**: Access to dashboard, users, subscriptions, tickets, content, analytics
- **support_manager**: Access to tickets only
- **support_agent**: Access to tickets only
- **content_manager**: Access to content only
- **finance_manager**: Access to subscriptions only
- **marketing_manager**: Access to marketing only
- **analytics_manager**: Access to analytics only
- **developer**: Access to developer tools only

## Authentication

Currently, the admin panel uses a mock authentication function (`getCurrentAdmin()` in `lib/auth.ts`). This should be replaced with actual JWT authentication when integrating with the backend.

To integrate with your backend:

1. Update `lib/auth.ts` to fetch admin data from your API
2. Update `lib/axiosInstance.ts` to handle authentication tokens
3. Update `middleware.ts` to verify JWT tokens from cookies/headers

## Backend Integration

The admin panel is configured to connect to your existing backend API at `http://localhost:5000/api`. Update the `NEXT_PUBLIC_API_URL` environment variable to point to your production API when deploying.

## Building for Production

```bash
npm run build
npm start
```

## License

Private - MR English Project

