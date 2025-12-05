# ResolveIt v2 - UI Frontend

A modern, responsive UI frontend for the ResolveIt ticket management system, built with Next.js 16, React 19, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
v2/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard and features
│   │   ├── agent/              # Agent dashboard and features
│   │   ├── auth/               # Authentication pages
│   │   ├── components/         # Reusable React components
│   │   │   ├── charts/         # Chart components (ApexCharts)
│   │   │   └── ...             # UI components
│   │   ├── config/             # Configuration files
│   │   ├── globals.css         # Global styles and design system
│   │   └── layout.tsx          # Root layout
│   └── lib/                    # Utilities and mock data
├── public/                     # Static assets
├── tailwind.config.ts          # Tailwind configuration
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: `#0f36a5` (Blue) - Main brand color
- **Accent**: `#f24d12` (Orange) - Accent and focus states
- **Background**: `#f6f6f7` (Light gray) - Page background
- **Text**: `#111827` (Dark gray) - Primary text
- **Muted**: `#6b7280` (Gray) - Secondary text

### Typography
- **Font**: Source Sans Pro
- **Headings**: 
  - h1: 24px/700 (bold)
  - h2: 20px/600 (semibold)
  - h3: 18px/600 (semibold)
- **Body**: 14px/1.5 line-height

### Components
- **Cards**: White background, thin gray borders, no shadows
- **Buttons**: Standardized utility classes (`.btn`, `.btn-primary`, etc.)
- **Forms**: Consistent inputs with accent focus states
- **Spacing**: Consistent scale (4px, 8px, 12px, 16px, 24px)

## 🧩 Key Features

### Authentication
- ✅ Login with email/password
- ✅ User registration with validation
- ✅ Forgot password flow
- ✅ Invite acceptance page
- ✅ Session management

### Admin Dashboard
- ✅ Stats cards (Total, Active, Resolved, New Today)
- ✅ Charts: Tickets by Day, Status, Priority, Agent, Category
- ✅ Real-time metrics with mock data

### Ticket Management
- ✅ List view with table and card layouts
- ✅ Advanced filtering (status, priority, assignee, tags)
- ✅ Search functionality
- ✅ Bulk actions (assign, status update)
- ✅ CSV export
- ✅ Saved views
- ✅ Create ticket modal with file uploads
- ✅ Ticket detail view with comments, attachments, history

### User Management
- ✅ User list with search and role filtering
- ✅ User detail view
- ✅ Role-based access control

### Tags & Priorities
- ✅ Create, edit, delete tags
- ✅ Create, edit, delete priorities
- ✅ Tabbed interface

### Invitations
- ✅ List invitations
- ✅ Create new invitations
- ✅ Resend and revoke invitations
- ✅ Auto-refresh functionality

### Analytics
- ✅ Advanced analytics page
- ✅ Detailed charts and metrics
- ✅ Performance tracking

### Agent Features
- ✅ Agent dashboard with assigned tickets stats
- ✅ Filtered ticket list (assigned tickets only)
- ✅ Ticket detail view with update capabilities

## 🛠️ Technology Stack

- **Framework**: Next.js 16.0.6 (App Router)
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4
- **Charts**: ApexCharts (react-apexcharts)
- **Icons**: Font Awesome (React FontAwesome)
- **Forms**: React Phone Number Input
- **TypeScript**: 5.x
- **State Management**: React Context (Toast notifications)

## 📦 Key Dependencies

```json
{
  "next": "16.0.6",
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "tailwindcss": "^4",
  "apexcharts": "^5.3.6",
  "react-apexcharts": "^1.9.0",
  "@fortawesome/react-fontawesome": "^3.1.1",
  "react-phone-number-input": "^3.4.14"
}
```

## 🎯 UI Components

### Reusable Components
- `AdminHeader` - Top navigation bar
- `AdminSidebar` - Sidebar navigation
- `DataTable` - Responsive data table with sorting
- `StatCard` - Dashboard statistics cards
- `StatusBadge` - Status indicator badges
- `Pagination` - Page navigation component
- `MobileFilterSheet` - Mobile filter bottom sheet
- `FileUpload` - File upload with preview
- `AttachmentItem` - Attachment display component
- `MediaPreview` - Full-screen media preview modal
- `Toast` / `Toaster` - Toast notification system
- `Skeleton` - Loading skeleton components
- `EmptyState` - Empty state component
- `FormInput` - Form input component

### Chart Components
- `AreaChart` - Area chart for time series
- `DonutChart` - Donut chart for distributions
- `BarChart` - Bar chart component
- `LineChart` - Line chart component
- `PieChart` - Pie chart component

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Touch-friendly** interactions (44px minimum touch targets)
- **Table to card** conversion on mobile
- **Collapsible sidebar** on mobile
- **Mobile filter sheets** for complex filters

## 🎨 Styling Guidelines

### Button Classes
```tsx
<button className="btn btn-primary">Primary Button</button>
<button className="btn btn-secondary">Secondary Button</button>
<button className="btn btn-outline">Outline Button</button>
<button className="btn btn-ghost">Ghost Button</button>
<button className="btn btn-danger">Danger Button</button>
<button className="btn btn-sm">Small Button</button>
<button className="btn btn-lg">Large Button</button>
```

### Form Inputs
All form inputs use consistent styling:
- Background: `#f9fafb` (gray-50)
- Border: `#e5e7eb` (gray-200)
- Focus: Accent color (`#f24d12`) with ring
- Border radius: `0.125rem` (2px)

### Cards
- White background
- Thin gray border (`#e5e7eb`)
- No shadows
- Border radius: `0.125rem` (2px)

## 🔐 Authentication

Currently using mock authentication for UI development:
- **Mock Credentials**: 
  - Email: `admin@resolveit.rw` / Password: `password123`
  - Email: `agent@resolveit.rw` / Password: `password123`

Authentication state is stored in `sessionStorage` for development purposes.

## 📊 Mock Data

The application uses mock data for development:
- Mock tickets, users, tags, priorities
- Mock dashboard statistics
- Mock chart data
- All data is generated in `src/lib/mockData.ts`

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=https://resolveit.rw
```

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📝 Development Notes

- All pages are client-side rendered (`'use client'`)
- Mock data is used throughout for UI development
- TypeScript is strictly enforced
- Components follow a consistent design system
- Mobile-first responsive design
- Accessible components with proper ARIA labels

## 🔗 Related Projects

- **Backend API**: See `/backend` directory
- **v1 Client**: See `/client` directory
- **Documentation**: See `/documentation` directory

## 📄 License

Private project - All rights reserved

## 👥 Contributors

Rwanda ICT Chamber

---

**Version**: 2.0.0  
**Status**: UI Complete - Ready for Backend Integration  
**Last Updated**: January 2025
