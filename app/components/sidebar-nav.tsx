'use client';

import { Home, Puzzle } from "lucide-react";
import { NavLink } from "./nav-link";

export function SidebarNav() {
  return (
    <nav className="space-y-1 p-2">
      <NavLink href="/workspace" iconName="home">
        <Home className="h-4 w-4" />
        Workspaces
      </NavLink>
      <NavLink href="/extensions" iconName="puzzle" exact>
        <Puzzle className="h-4 w-4" />
        Extensions
      </NavLink>
    </nav>
  );
} 