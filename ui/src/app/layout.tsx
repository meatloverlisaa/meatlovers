import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { fontClassNames } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meat Lovers CIMS",
  description: "Customer Information Management System for Meat Lovers - Restaurant, bar, catering, and delivery services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontClassNames} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
