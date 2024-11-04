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
}

export function SuggestionList({ 
  title, 
  description, 
  items, 
  onUpdate,
  categories,
  selectedCategory,
  onCategoryChange,
  onAdd
}: SuggestionListProps) {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      const itemToAdd = {
        symptom: newItem.trim(),
        category: selectedCategory || 'Other'
      };
      if (onAdd) {
        onAdd(itemToAdd);
      } else {
        onUpdate([...items, itemToAdd.symptom]);
      }
      setNewItem('');
    }
  };

  const removeItem = (item: string) => {
    onUpdate(items.filter(i => i !== item));
  };

  const isHeaderItem = (item: string) => {
    return item.startsWith('#')
  };

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            isHeaderItem(item) ? (
              <div key={item} className="w-full text-lg font-semibold mt-4 mb-2 text-primary-dark">
                {item.replace('#', '').trim()}
              </div>
            ) : (
              <Badge
                key={item}
                variant="secondary"
                className="bg-primary-dark text-white hover:bg-primary"
              >
                {item}
                <X
                  className="ml-2 h-3 w-3 cursor-pointer"
                  onClick={() => removeItem(item)}
                />
              </Badge>
            )
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add new item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="bg-primary-light"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem();
                }
              }}
            />
            {categories && (
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              onClick={addItem}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}