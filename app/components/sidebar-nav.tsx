'use client';

import { Home, Puzzle, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const items: SidebarNavItem[] = [
  {
    title: "Workspaces",
    href: "/workspace",
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: "Extensions",
    href: "/extensions",
    icon: <Puzzle className="h-4 w-4" />,
    exact: true,
  },
  {
    title: "Scheduler",
    href: "/scheduler",
    icon: <Calendar className="h-4 w-4" />,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Welluable Assist</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
} 