import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/layout/Navbar";
import CartSidebar from "@/components/layout/CartSidebar";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "GreenRev | One Automotive Ecosystem",
  description: "Connecting buyers with independent vehicle dealers, automotive parts vendors, mechanics and other automotive service providers through one integrated platform.",
  keywords: [
    "automotive marketplace", 
    "vehicle dealers", 
    "automotive parts", 
    "mechanics", 
    "Africa automotive",
    "GreenRev",
    "car sales",
    "car parts"
  ],
  authors: [{ name: "GreenCrest Limited" }],
  openGraph: {
    title: "GreenRev | One Automotive Ecosystem",
    description: "Connecting buyers with independent vehicle dealers, automotive parts vendors, mechanics and other automotive service providers through one integrated platform.",
    url: "https://greenrev.com",
    siteName: "GreenRev",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenRev | One Automotive Ecosystem",
    description: "Connecting buyers with independent vehicle dealers, automotive parts vendors, mechanics and other automotive service providers through one integrated platform.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("bg-background text-foreground antialiased selection:bg-accent selection:text-black")}>
        <AuthProvider>
          <SocketProvider>
            <CompareProvider>
              <CartProvider>
                <SmoothScroll>
                  <Navbar />
                  {children}
                </SmoothScroll>
                <CartSidebar />
                <Toaster position="bottom-right" />
              </CartProvider>
            </CompareProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
