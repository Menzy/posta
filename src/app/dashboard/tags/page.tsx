"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tag as TagIcon, 
  Hash, 
  Search,
  FolderOpen,
  FileText,
  BookOpen,
  Link as LinkIcon,
  Image as ImageIcon,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { TagManager } from "@/components/tags/tag-manager";

export default function TagsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);

  const tags = useQuery(api.tags.getTagsWithUsage);
  const tagContent = useQuery(
    api.tags.getContentByTag,
    selectedTag ? { tagName: selectedTag } : "skip"
  );

  const filteredTags = tags?.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sortedTags = filteredTags.sort((a, b) => b.actualUsageCount - a.actualUsageCount);

  const getContentIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderOpen className="h-4 w-4" />;
      case "script":
        return <FileText className="h-4 w-4" />;
      case "note":
        return <BookOpen className="h-4 w-4" />;
      case "inspiration":
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const getContentUrl = (item: any, type: string) => {
    switch (type) {
      case "project":
        return `/dashboard/projects/${item._id}`;
      case "script":
        return `/dashboard/scripts/${item._id}`;
      case "note":
        return `/dashboard/notes/${item._id}`;
      case "inspiration":
        return "/dashboard/inspirations";
      default:
        return "#";
    }
  };

  if (tags === undefined) {
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
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground">
            Organize and find your content with tags
          </p>
        </div>
        <TagManager />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Tag Overview</TabsTrigger>
          <TabsTrigger value="browse">Browse by Tag</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tag Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
                <TagIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tags.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Used Tags</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tags.filter(tag => tag.actualUsageCount > 0).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tags.reduce((sum, tag) => sum + tag.actualUsageCount, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags List */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">All Tags</h3>
            {sortedTags.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Hash className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "No tags found" : "No tags created yet"}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchQuery 
                      ? `No tags match "${searchQuery}"`
                      : "Start organizing your content by creating tags"
                    }
                  </p>
                  {!searchQuery && <TagManager trigger={
                    <Button>
                      <TagIcon className="h-4 w-4 mr-2" />
                      Create Your First Tag
                    </Button>
                  } />}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {sortedTags.map((tag) => (
                  <Card
                    key={tag._id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTag === tag.name ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedTag(tag.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={tag.color || ""}
                        >
                          #{tag.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {tag.actualUsageCount} use{tag.actualUsageCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {selectedTag ? `Content tagged with "${selectedTag}"` : "Select a tag to browse content"}
            </h3>
            {selectedTag && (
              <Button variant="outline" onClick={() => setSelectedTag(null)}>
                Clear Selection
              </Button>
            )}
          </div>

          {!selectedTag ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <TagIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Tag</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Choose a tag from the overview to see all content with that tag
                </p>
              </CardContent>
            </Card>
          ) : tagContent === undefined ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Projects */}
              {tagContent.projects.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-medium flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Projects ({tagContent.projects.length})
                  </h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {tagContent.projects.map((project) => (
                      <Card key={project._id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            <Link
                              href={getContentUrl(project, "project")}
                              className="font-medium hover:underline line-clamp-1 flex-1"
                            >
                              {project.title}
                            </Link>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Updated {new Date(project.updatedAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Scripts */}
              {tagContent.scripts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Scripts ({tagContent.scripts.length})
                  </h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {tagContent.scripts.map((script) => (
                      <Card key={script._id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <Link
                              href={getContentUrl(script, "script")}
                              className="font-medium hover:underline line-clamp-1 flex-1"
                            >
                              {script.title}
                            </Link>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Updated {new Date(script.updatedAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {tagContent.notes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-medium flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Notes ({tagContent.notes.length})
                  </h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {tagContent.notes.map((note) => (
                      <Card key={note._id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <Link
                              href={getContentUrl(note, "note")}
                              className="font-medium hover:underline line-clamp-1 flex-1"
                            >
                              {note.title}
                            </Link>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Updated {new Date(note.updatedAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Inspirations */}
              {tagContent.inspirations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-medium flex items-center">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Inspirations ({tagContent.inspirations.length})
                  </h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {tagContent.inspirations.map((inspiration) => (
                      <Card key={inspiration._id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            {inspiration.type === "image" ? (
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium line-clamp-1 flex-1">
                              {inspiration.title}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(inspiration.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No content message */}
              {tagContent.projects.length === 0 &&
                tagContent.scripts.length === 0 &&
                tagContent.notes.length === 0 &&
                tagContent.inspirations.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Hash className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No content found</h3>
                    <p className="text-muted-foreground text-center">
                      No content is currently tagged with "{selectedTag}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}