"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Image as ImageIcon, 
  MoreHorizontal,
  ExternalLink,
  Download,
  Trash2
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageUpload } from "@/components/upload/image-upload";
import { TagInput } from "@/components/tags/tag-input";
import { TagManager } from "@/components/tags/tag-manager";
import { Id } from "../../../../convex/_generated/dataModel";

export default function ImagesPage() {
  const images = useQuery(api.files.getUserImages);
  const deleteFile = useMutation(api.files.deleteFile);

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleDeleteImage = async (fileId: Id<"_storage">, inspirationId: Id<"inspirations">) => {
    if (confirm("Are you sure you want to delete this image?")) {
      await deleteFile({ fileId, inspirationId });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (images === undefined) {
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
          <h1 className="text-3xl font-bold">Image Gallery</h1>
          <p className="text-muted-foreground">
            Your uploaded images and visual inspirations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TagManager />
          <Button onClick={() => setIsUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No images yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your visual inspiration collection by uploading images
            </p>
            <Button onClick={() => setIsUploadOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <Card key={image._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-square">
                {image.url && (
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {image.url && (
                        <>
                          <DropdownMenuItem asChild>
                            <a href={image.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Full Size
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={image.url} download={image.title}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem>
                        Move to Project
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => image.fileId && handleDeleteImage(image.fileId, image._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Image
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Image metadata overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <h3 className="text-white font-medium text-sm line-clamp-1">
                    {image.title}
                  </h3>
                </div>
              </div>
              
              <CardContent className="p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>
                    {image.metadata?.width && image.metadata?.height && (
                      `${image.metadata.width} × ${image.metadata.height}`
                    )}
                  </span>
                  <span>
                    {image.metadata?.fileSize && formatFileSize(image.metadata.fileSize as number)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                  <span className="capitalize">
                    {image.metadata?.mimeType?.split('/')[1]}
                  </span>
                </div>

                <div className="mt-3">
                  <TagInput
                    itemType="inspirations"
                    itemId={image._id}
                    currentTags={image.tags}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ImageUpload 
        open={isUploadOpen} 
        onOpenChange={setIsUploadOpen}
        onUploadComplete={() => {
          // Images will automatically update due to Convex reactivity
        }}
      />
    </div>
  );
}