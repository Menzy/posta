"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  File, 
  ExternalLink,
  Youtube,
  Instagram,
  Twitter,
  MoreHorizontal
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/upload/image-upload";
import { TagInput } from "@/components/tags/tag-input";
import { TagManager } from "@/components/tags/tag-manager";

export default function InspirationsPage() {
  const inspirations = useQuery(api.inspirations.getInspirations, {});
  const createInspiration = useMutation(api.inspirations.createInspiration);
  const deleteInspiration = useMutation(api.inspirations.deleteInspiration);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateInspiration = async () => {
    if (!title.trim()) return;
    
    setIsCreating(true);
    try {
      await createInspiration({
        title: title.trim(),
        url: url.trim() || undefined,
        type: url.trim() ? "link" : "file",
      });
      setTitle('');
      setUrl('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create inspiration:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteInspiration = async (inspirationId: string) => {
    if (confirm("Are you sure you want to delete this inspiration?")) {
      await deleteInspiration({ id: inspirationId as any }); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  };

  const getPlatformIcon = (metadata: Record<string, unknown> | undefined) => {
    if (!metadata?.platform) return <LinkIcon className="h-4 w-4" />;
    
    switch (metadata.platform) {
      case 'YouTube':
        return <Youtube className="h-4 w-4 text-red-500" />;
      case 'Instagram':
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'Twitter/X':
        return <Twitter className="h-4 w-4 text-blue-500" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'file':
        return <File className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  if (inspirations === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inspirations</h1>
          <p className="text-muted-foreground">
            Save links, images, and resources for your content
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TagManager />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <LinkIcon className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Inspiration</DialogTitle>
              <DialogDescription>
                Add a link, image, or resource to inspire your content creation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for this inspiration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL (optional)</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateInspiration}
                disabled={!title.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Inspiration'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button onClick={() => setIsImageUploadOpen(true)} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
        </div>
      </div>

      {inspirations.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <LinkIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No inspirations yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start collecting links, images, and resources that inspire your content
            </p>
            <div className="flex items-center space-x-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button onClick={() => setIsImageUploadOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inspirations.map((inspiration) => (
            <Card key={inspiration._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-sm border bg-background">
                    {inspiration.url ? getPlatformIcon(inspiration.metadata) : getTypeIcon(inspiration.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-2">
                      {inspiration.title}
                    </CardTitle>
                    {inspiration.metadata?.domain && (
                      <CardDescription className="line-clamp-1 mt-1">
                        {inspiration.metadata.domain}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {inspiration.url && (
                      <DropdownMenuItem asChild>
                        <a href={inspiration.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Link
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      Move to Project
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteInspiration(inspiration._id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              
              <CardContent>
                {/* Preview thumbnail for videos and images */}
                {(inspiration.metadata?.thumbnail || inspiration.type === 'image') && (
                  <div className="mb-3">
                    <Image
                      src={(inspiration.metadata?.thumbnail || inspiration.url) as string}
                      alt="Preview"
                      width={400}
                      height={128}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}

                {/* Metadata info */}
                {inspiration.metadata?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {inspiration.metadata.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span className="flex items-center">
                    {getTypeIcon(inspiration.type)}
                    <span className="ml-1 capitalize">{inspiration.type}</span>
                  </span>
                  <span>
                    {new Date(inspiration.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3">
                  <TagInput
                    itemType="inspirations"
                    itemId={inspiration._id}
                    currentTags={inspiration.tags}
                  />
                </div>

                {inspiration.url && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={inspiration.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open Link
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ImageUpload 
        open={isImageUploadOpen} 
        onOpenChange={setIsImageUploadOpen}
        onUploadComplete={() => {
          // Refresh inspirations list after upload
          window.location.reload();
        }}
      />
    </div>
  );
}