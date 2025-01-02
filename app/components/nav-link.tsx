'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";

interface NavLinkProps {
  href: string;
  iconName: string;
  children: React.ReactNode;
  exact?: boolean;
}

export function NavLink({ href, iconName, children, exact = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname?.startsWith(href);

  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
        isActive && "bg-accent"
      )}
    >
      <span className="h-4 w-4" data-icon={iconName} />
      {children}
    </Link>
  );
} 