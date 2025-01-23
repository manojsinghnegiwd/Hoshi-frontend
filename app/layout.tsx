import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SupabaseProvider } from '@/providers/supabase-provider'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hoshi",
  description: "AI Agent Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-background")}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
