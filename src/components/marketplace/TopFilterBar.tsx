
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronDown, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ItemType, Visibility } from "./LeftFilters";

interface TopFilterBarProps {
  currentType: ItemType;
  onTypeChange: (t: ItemType) => void;
  sort: "Newest" | "MostRelevant";
  onSortChange: (s: "Newest" | "MostRelevant") => void;
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
}

export function TopFilterBar({
  currentType,
  onTypeChange,
  sort,
  onSortChange,
  visibility,
  onVisibilityChange,
}: TopFilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <Tabs value={currentType} onValueChange={(v) => onTypeChange(v as any)} className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="occupation">Occupations</TabsTrigger>
          <TabsTrigger value="post">Posts</TabsTrigger>
          <TabsTrigger value="group">Groups</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Sort: {sort} <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onSortChange("Newest")}>Newest</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("MostRelevant")}>Most relevant</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              {visibility === "All" ? "Visibility: All" : `Visibility: ${visibility}`}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onVisibilityChange("All")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onVisibilityChange("CommunityOnly")}>Community only</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onVisibilityChange("CommunityAndCompanies")}>Community + Companies</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default TopFilterBar;
