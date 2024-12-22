import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Tag, Tags } from "lucide-react";

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
      // Remove subcategories associated with the removed category
      const removedSubcategories = subcategories[category as keyof typeof subcategories] || [];
      setSelectedSubcategory(selectedSubcategory.filter(s => !removedSubcategories.includes(s)));
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
    // Remove subcategories associated with the removed category
    const removedSubcategories = subcategories[category as keyof typeof subcategories] || [];
    setSelectedSubcategory(selectedSubcategory.filter(s => !removedSubcategories.includes(s)));
  };

  const removeSubcategory = (subcategory: string) => {
    setSelectedSubcategory(selectedSubcategory.filter(s => s !== subcategory));
  };

  const availableSubcategories = selectedCategory.length > 0
    ? selectedCategory.flatMap(cat => subcategories[cat as keyof typeof subcategories] || [])
    : Object.values(subcategories).flat();

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <Label>Categories</Label>
          </div>
          <ScrollArea className="h-24 rounded-md border p-2">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory.includes(category) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </ScrollArea>
          {selectedCategory.length > 0 && (
            <div className="mt-2">
              <Label className="text-sm text-muted-foreground">Selected Categories:</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedCategory.map((category) => (
                  <Badge key={category} variant="secondary" className="pr-1">
                    {category}
                    <button
                      onClick={() => removeCategory(category)}
                      className="ml-1 hover:bg-secondary/80 rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            <Label>Subcategories</Label>
          </div>
          <ScrollArea className="h-24 rounded-md border p-2">
            <div className="flex flex-wrap gap-2">
              {availableSubcategories.map((subcategory) => (
                <Badge
                  key={subcategory}
                  variant={selectedSubcategory.includes(subcategory) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => handleSubcategorySelect(subcategory)}
                >
                  {subcategory}
                </Badge>
              ))}
            </div>
          </ScrollArea>
          {selectedSubcategory.length > 0 && (
            <div className="mt-2">
              <Label className="text-sm text-muted-foreground">Selected Subcategories:</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedSubcategory.map((subcategory) => (
                  <Badge key={subcategory} variant="secondary" className="pr-1">
                    {subcategory}
                    <button
                      onClick={() => removeSubcategory(subcategory)}
                      className="ml-1 hover:bg-secondary/80 rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}