import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Database } from "@/integrations/supabase/types";

type Categories = Database['public']['Enums']['categories'];
type Subcategories = Database['public']['Enums']['subcategories'];

interface BlogFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (value: string) => void;
  showRecentOnly: boolean;
  setShowRecentOnly: (value: boolean) => void;
}

const categories: Categories[] = [
  "Technology",
  "Career Guidance",
  "Educational Resources"
];

const subcategories: Record<Categories, Subcategories[]> = {
  "Technology": ["Technical Skill Mastery", "Essential Tech Skills for the Workplace"],
  "Career Guidance": ["Industry-Specific Career Insights", "Career Advancement Strategies"],
  "Educational Resources": ["Study Tips", "Online Learning Platforms"],
  // Add other categories with their subcategories as needed
} as Record<Categories, Subcategories[]>;

export function BlogFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  showRecentOnly,
  setShowRecentOnly,
}: BlogFiltersProps) {
  return (
    <div className="grid gap-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={selectedSubcategory} 
          onValueChange={setSelectedSubcategory}
          disabled={!selectedCategory || selectedCategory === "_all"}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select subcategory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Subcategories</SelectItem>
            {selectedCategory && selectedCategory !== "_all" && 
              subcategories[selectedCategory as Categories]?.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Switch
            id="recent-posts"
            checked={showRecentOnly}
            onCheckedChange={setShowRecentOnly}
          />
          <Label htmlFor="recent-posts">Recent posts only</Label>
        </div>
      </div>
    </div>
  );
}