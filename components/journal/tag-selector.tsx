"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const { data: availableTags = [] } = trpc.journal.getTags.useQuery();
  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredTags(availableTags.filter(tag => !selectedTags.includes(tag)));
    } else {
      setFilteredTags(
        availableTags.filter(
          tag => 
            tag.toLowerCase().includes(inputValue.toLowerCase()) && 
            !selectedTags.includes(tag)
        )
      );
    }
  }, [inputValue, availableTags, selectedTags]);

  const addTag = (tag: string) => {
    if (tag.trim() !== "" && !selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tag => (
          <Badge 
            key={tag} 
            variant="secondary"
            className="flex items-center gap-1 bg-primary-light/80 text-primary-dark"
          >
            {tag}
            <button 
              type="button"
              onClick={() => removeTag(tag)} 
              className="ml-1 rounded-full hover:bg-primary-dark/10"
            >
              <X size={14} />
            </button>
          </Badge>
        ))}
      </div>
      
      <div className="relative">
        <div className="flex">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(inputValue);
              }
            }}
            placeholder="Add tags..."
            className="bg-primary-light"
          />
          <Button
            type="button"
            onClick={() => addTag(inputValue)}
            className="ml-2 bg-secondary hover:bg-secondary-dark text-white"
          >
            <Plus size={20} />
          </Button>
        </div>
        
        {filteredTags.length > 0 && inputValue && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredTags.map(tag => (
              <div
                key={tag}
                onClick={() => addTag(tag)}
                className="p-2 hover:bg-primary-light/20 cursor-pointer"
              >
                {tag}
              </div>
            ))}
          </div>
        )}
        
        {availableTags.length > 0 && !inputValue && (
          <div className="mt-2">
            <p className="text-sm text-primary-dark/70 mb-1">Recently used tags:</p>
            <div className="flex flex-wrap gap-1">
              {availableTags.slice(0, 5).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary-light/50"
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 