'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SuggestionListProps {
  title: string;
  description: string;
  items: string[];
  onUpdate: (items: string[]) => void;
  allowHeaders?: boolean;
}

export function SuggestionList({ 
  title, 
  description, 
  items, 
  onUpdate,
  allowHeaders = false 
}: SuggestionListProps) {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onUpdate([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (item: string) => {
    onUpdate(items.filter(i => i !== item));
  };

  const isHeader = (item: string) => {
    return item.startsWith('---') && item.endsWith('---');
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
            isHeader(item) ? (
              <div key={item} className="w-full text-lg font-semibold mt-4 mb-2 text-primary-dark">
                {item.replace(/---/g, '').trim()}
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
          <Button
            onClick={addItem}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}