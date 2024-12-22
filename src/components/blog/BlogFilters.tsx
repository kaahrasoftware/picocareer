import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface BlogFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string[];
  setSelectedCategory: (value: string[]) => void;
  selectedSubcategory: string[];
  setSelectedSubcategory: (value: string[]) => void;
  showRecentOnly: boolean;
  setShowRecentOnly: (value: boolean) => void;
}

const categories = ["Technology", "Career", "Education"];
const subcategories = {
  Technology: ["Programming", "Data Science", "Web Development"],
  Career: ["Job Search", "Interview Tips", "Career Change"],
  Education: ["Study Tips", "College Life", "Graduate School"],
};

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
  const handleCategorySelect = (category: string) => {
    if (selectedCategory.includes(category)) {
      setSelectedCategory(selectedCategory.filter(c => c !== category));
    } else {
      setSelectedCategory([...selectedCategory, category]);
    }
  };

  const handleSubcategorySelect = (subcategory: string) => {
    if (selectedSubcategory.includes(subcategory)) {
      setSelectedSubcategory(selectedSubcategory.filter(s => s !== subcategory));
    } else {
      setSelectedSubcategory([...selectedSubcategory, subcategory]);
    }
  };

  const removeCategory = (category: string) => {
    setSelectedCategory(selectedCategory.filter(c => c !== category));
  };

  const removeSubcategory = (subcategory: string) => {
    setSelectedSubcategory(selectedSubcategory.filter(s => s !== subcategory));
  };

  const availableSubcategories = selectedCategory.length > 0
    ? selectedCategory.flatMap(cat => subcategories[cat as keyof typeof subcategories] || [])
    : Object.values(subcategories).flat();

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="recent-posts"
            checked={showRecentOnly}
            onCheckedChange={setShowRecentOnly}
          />
          <Label htmlFor="recent-posts">Recent posts only</Label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Categories</Label>
          <ScrollArea className="h-20 rounded-md border p-2">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div>
          <Label className="mb-2 block">Selected Categories</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCategory.map((category) => (
              <Badge key={category} variant="secondary" className="pr-1">
                {category}
                <button
                  onClick={() => removeCategory(category)}
                  className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Subcategories</Label>
          <ScrollArea className="h-20 rounded-md border p-2">
            <div className="flex flex-wrap gap-2">
              {availableSubcategories.map((subcategory) => (
                <Badge
                  key={subcategory}
                  variant={selectedSubcategory.includes(subcategory) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSubcategorySelect(subcategory)}
                >
                  {subcategory}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div>
          <Label className="mb-2 block">Selected Subcategories</Label>
          <div className="flex flex-wrap gap-2">
            {selectedSubcategory.map((subcategory) => (
              <Badge key={subcategory} variant="secondary" className="pr-1">
                {subcategory}
                <button
                  onClick={() => removeSubcategory(subcategory)}
                  className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}