import type { Metadata } from "next";
import "./globals.css";
import "./config/fontawesome";
import { ToastProvider } from "./components/Toaster";
import AuthInitializer from "./components/AuthInitializer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://resolveit.rw'),
  title: {
    default: "ResolveIt - Ticket Management System",
    template: "%s | ResolveIt",
  },
  description: "ResolveIt - Complete ticket management system with role-based access control for admins, agents, and customers",
  keywords: ["ticket management", "support system", "resolveit", "customer support", "help desk"],
  authors: [{ name: "ResolveIt" }],
  creator: "ResolveIt",
  publisher: "ResolveIt",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://resolveit.rw',
    siteName: "ResolveIt",
    title: "ResolveIt - Ticket Management System",
    description: "Complete ticket management system with role-based access control",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthInitializer />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

