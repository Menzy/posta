"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  itemType: "projects" | "scripts" | "notes" | "inspirations";
  itemId: string;
  currentTags: string[];
  onTagsChange?: (tags: string[]) => void;
  className?: string;
}

export function TagInput({ 
  itemType, 
  itemId, 
  currentTags, 
  onTagsChange,
  className 
}: TagInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  
  const tags = useQuery(api.tags.getTags);
  const addTag = useMutation(api.tags.addTagToItem);
  const removeTag = useMutation(api.tags.removeTagFromItem);

  const handleAddTag = async (tagName: string) => {
    if (!tagName.trim() || currentTags.includes(tagName.toLowerCase())) {
      return;
    }

    try {
      await addTag({
        itemType,
        itemId,
        tagName: tagName.trim(),
      });
      onTagsChange?.([...currentTags, tagName.toLowerCase()]);
      setInputValue("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to add tag:", error);
    }
  };

  const handleRemoveTag = async (tagName: string) => {
    try {
      await removeTag({
        itemType,
        itemId,
        tagName,
      });
      onTagsChange?.(currentTags.filter(t => t !== tagName));
    } catch (error) {
      console.error("Failed to remove tag:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const availableTags = tags?.filter(tag => 
    !currentTags.includes(tag.name) && 
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  ) || [];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <TagIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Tags</span>
      </div>
      
      {/* Current Tags */}
      <div className="flex flex-wrap gap-1">
        {currentTags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
            <Button
              variant="ghost"
              size="icon"
              className="h-3 w-3 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              onClick={() => handleRemoveTag(tag)}
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        ))}
        
        {/* Add Tag Button */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs border-dashed"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search or create tag..."
                value={inputValue}
                onValueChange={setInputValue}
                onKeyDown={handleKeyDown}
              />
              <CommandList>
                {inputValue && !availableTags.some(tag => tag.name === inputValue.toLowerCase()) && (
                  <CommandGroup heading="Create">
                    <CommandItem
                      onSelect={() => handleAddTag(inputValue)}
                      className="cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create "{inputValue}"
                    </CommandItem>
                  </CommandGroup>
                )}
                
                {availableTags.length > 0 && (
                  <CommandGroup heading="Existing Tags">
                    {availableTags.map((tag) => (
                      <CommandItem
                        key={tag._id}
                        onSelect={() => handleAddTag(tag.name)}
                        className="cursor-pointer"
                      >
                        <TagIcon className="h-4 w-4 mr-2" />
                        <span>{tag.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {tag.usageCount}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {!inputValue && availableTags.length === 0 && (
                  <CommandEmpty>No tags found.</CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}