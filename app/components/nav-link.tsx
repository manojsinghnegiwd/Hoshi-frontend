'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  iconName: string;
  exact?: boolean;
  collapsed?: boolean;
  children: React.ReactNode;
}

export function NavLink({ href, iconName, exact = false, collapsed = false, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact 
    ? pathname === href
    : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
        collapsed ? "justify-center" : "",
        isActive ? "bg-accent" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
} 