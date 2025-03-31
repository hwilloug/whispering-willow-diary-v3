'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SuggestionListProps {
  title: string;
  description: string;
  items: string[];
  onUpdate: (items: string[]) => void;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  onAdd?: (item: {symptom: string, category: string}) => void;
  groupByCategory?: boolean;
  groupedItems?: Array<{category: string, items: string[]}>;
}

export function SuggestionList({
  title,
  description,
  items,
  onUpdate,
  categories,
  selectedCategory,
  onCategoryChange,
  onAdd,
  groupByCategory,
  groupedItems
}: SuggestionListProps) {
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState(selectedCategory || categories?.[0] || 'Other');

  const handleAdd = () => {
    if (newItem.trim()) {
      if (onAdd && categories) {
        onAdd({ symptom: newItem, category });
      } else {
        onUpdate([...items, newItem]);
      }
      setNewItem('');
    }
  };

  const handleRemove = (item: string) => {
    onUpdate(items.filter(i => i !== item));
  };

  if (groupByCategory && groupedItems) {
    return (
      <Card className="card-glass">
        <CardHeader className="border-b border-primary-light/20">
          <CardTitle className="text-primary-dark text-xl">{title}</CardTitle>
          <CardDescription className="text-primary-dark/80">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex gap-2">
            <Input
              placeholder="Add new symptom..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              className="input-field"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px] bg-white/80 border-primary-light/30">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAdd}
              className="bg-secondary hover:bg-secondary-light text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {groupedItems.map(({ category, items }) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold text-primary-dark border-b border-primary-light/20 pb-2">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2 pl-2">
                  {items.map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="px-3 py-1 bg-secondary-light hover:bg-secondary text-primary-dark hover:text-white transition-colors"
                    >
                      {item}
                      <X
                        className="ml-2 h-3 w-3 hover:text-red-400"
                        onClick={() => handleRemove(item)}
                      />
                    </Badge>
                  ))}
                  {items.length === 0 && (
                    <span className="text-primary-dark/50 text-sm italic">
                      No items added yet
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Original non-grouped view with improved styling
  return (
    <Card className="card-glass">
      <CardHeader className="border-b border-primary-light/20">
        <CardTitle className="text-primary-dark text-xl">{title}</CardTitle>
        <CardDescription className="text-primary-dark/80">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex gap-2">
          <Input
            placeholder={`Add new ${title.toLowerCase()}...`}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            className="input-field"
          />
          <Button 
            onClick={handleAdd}
            className="bg-secondary hover:bg-secondary-light text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="px-3 py-1 bg-secondary-light/20 hover:bg-secondary text-primary-dark hover:text-white transition-colors"
            >
              {item}
              <X
                className="ml-2 h-3 w-3 hover:text-red-400"
                onClick={() => handleRemove(item)}
              />
            </Badge>
          ))}
          {items.length === 0 && (
            <span className="text-primary-dark/50 text-sm italic">
              No items added yet
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}