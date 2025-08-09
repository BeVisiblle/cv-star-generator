
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MarketplaceItem {
  id: string;
  type: "occupation" | "post" | "group";
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image_url?: string | null;
  location?: string | null;
  company_id?: string | null;
  author_profile_id?: string | null;
  tags: string[] | null;
  visibility: "CommunityOnly" | "CommunityAndCompanies";
  created_at: string;
}

interface ItemCardProps {
  item: MarketplaceItem;
  onView?: (id: string) => void;
}

export function ItemCard({ item, onView }: ItemCardProps) {
  const tags = item.tags || [];
  const top = item.image_url ? (
    <img src={item.image_url} alt="" className="w-full h-36 object-cover rounded-t-2xl" />
  ) : (
    <div className="w-full h-36 rounded-t-2xl bg-muted" />
  );

  if (item.type === "occupation") {
    return (
      <Card className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
        {top}
        <div className="p-4 flex-1 flex flex-col">
          <div className="font-semibold text-base line-clamp-2">{item.title}</div>
          {item.subtitle && <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.subtitle}</div>}
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 4).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
            ))}
          </div>
          <div className="mt-3">
            <Button size="sm" onClick={() => onView?.(item.id)}>View details</Button>
          </div>
        </div>
      </Card>
    );
  }

  if (item.type === "group") {
    return (
      <Card className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
        {top}
        <div className="p-4 flex-1 flex flex-col">
          <div className="font-semibold text-base line-clamp-2">{item.title}</div>
          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</div>
          <div className="mt-3">
            <Button size="sm" variant="secondary">
              <Users className="h-4 w-4 mr-2" /> Join
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // post
  return (
    <Card className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {top}
      <div className="p-4 flex-1 flex flex-col">
        <div className="font-semibold text-base line-clamp-2">{item.title}</div>
        {item.description && <div className="text-sm text-muted-foreground mt-1 line-clamp-3">{item.description}</div>}
        <div className="mt-3 flex items-center gap-2">
          <Button variant="ghost" size="sm"><Heart className="h-4 w-4 mr-1" /> Like</Button>
          <Button variant="ghost" size="sm"><MessageCircle className="h-4 w-4 mr-1" /> Comment</Button>
          <Button variant="ghost" size="sm"><Share2 className="h-4 w-4 mr-1" /> Share</Button>
        </div>
      </div>
    </Card>
  );
}

export default ItemCard;
