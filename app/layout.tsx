import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";

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
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 border-r bg-card">
            <div className="flex h-14 items-center border-b px-4">
              <Link href="/" className="font-semibold">
                Hoshi
              </Link>
            </div>
            <SidebarNav />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
