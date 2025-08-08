"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Tag as TagIcon, 
  Plus, 
  MoreHorizontal, 
  Trash2,
  Edit3,
  Hash,
  X
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface TagManagerProps {
  trigger?: React.ReactNode;
}

const tagColors = [
  "bg-red-100 text-red-800 border-red-200",
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-yellow-100 text-yellow-800 border-yellow-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
  "bg-orange-100 text-orange-800 border-orange-200",
];

export function TagManager({ trigger }: TagManagerProps) {
  const [open, setOpen] = React.useState(false);
  const [newTagName, setNewTagName] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [deleteTagId, setDeleteTagId] = React.useState<Id<"tags"> | null>(null);

  const tags = useQuery(api.tags.getTagsWithUsage);
  const createTag = useMutation(api.tags.createTag);
  const deleteTag = useMutation(api.tags.deleteTag);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreating(true);
    try {
      await createTag({
        name: newTagName.trim(),
        color: selectedColor || undefined,
      });
      setNewTagName("");
      setSelectedColor("");
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async (tagId: Id<"tags">) => {
    try {
      await deleteTag({ id: tagId });
      setDeleteTagId(null);
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  const sortedTags = tags?.sort((a, b) => b.actualUsageCount - a.actualUsageCount) || [];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <TagIcon className="h-4 w-4 mr-2" />
              Manage Tags
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Create, edit, and organize your content tags
            </DialogDescription>
          </DialogHeader>

          {/* Create New Tag */}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Create New Tag</Label>
              <div className="flex space-x-2">
                <Input
                  id="tag-name"
                  placeholder="Tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isCreating) {
                      handleCreateTag();
                    }
                  }}
                />
                <Button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || isCreating}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <Label>Color (optional)</Label>
              <div className="flex flex-wrap gap-1">
                {tagColors.map((colorClass, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(colorClass)}
                    className={`w-6 h-6 rounded border-2 ${colorClass} ${
                      selectedColor === colorClass ? "ring-2 ring-primary" : ""
                    }`}
                  />
                ))}
                <button
                  onClick={() => setSelectedColor("")}
                  className={`w-6 h-6 rounded border-2 border-gray-300 bg-white ${
                    selectedColor === "" ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <X className="h-3 w-3 mx-auto text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Existing Tags */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <Label>Your Tags ({sortedTags.length})</Label>
            {sortedTags.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Hash className="h-8 w-8 mx-auto mb-2" />
                <p>No tags created yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sortedTags.map((tag) => (
                  <div
                    key={tag._id}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={tag.color || ""}
                      >
                        {tag.name}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {tag.actualUsageCount} use{tag.actualUsageCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log("Edit not implemented yet")}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteTagId(tag._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteTagId !== null} onOpenChange={() => setDeleteTagId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag? This will remove it from all content where it's used. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTagId && handleDeleteTag(deleteTagId)}
            >
              Delete Tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}