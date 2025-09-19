import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import CartDrawer from "../components/CartDrawer";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import LayoutShell from "../components/LayoutShell";
import CookieConsent from "../components/CookieConsent";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sneco - Minimal Sneakers",
  description: "Modern minimalist sneakers e-commerce demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geistMono.variable} antialiased bg-white text-neutral-900`}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <LayoutShell>{children}</LayoutShell>
              <CartDrawer />
              <CookieConsent />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
