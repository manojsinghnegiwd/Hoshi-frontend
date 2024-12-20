import { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface EntityCardProps {
  id: number;
  name: string;
  description?: string | null;
  icon: LucideIcon;
  href: string;
  createdAt: Date;
}

export function EntityCard({ id, name, description, icon: Icon, href, createdAt }: EntityCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {name}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {description || 'No description'}
          </CardDescription>
          <CardDescription className="text-xs">
            Created on {new Date(createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
} 