"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  BookOpen,
  Link as LinkIcon,
  Image as ImageIcon,
  Plus,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TagInput } from "@/components/tags/tag-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [resolvedParams, setResolvedParams] = React.useState<{ id: string } | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  
  const router = useRouter();

  // Resolve params
  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const project = useQuery(
    api.projects.getProject,
    resolvedParams ? { id: resolvedParams.id as Id<"projects"> } : "skip"
  );

  const updateProject = useMutation(api.projects.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject);

  const scripts = useQuery(
    api.scripts.getScriptsByProject,
    resolvedParams ? { projectId: resolvedParams.id } : "skip"
  );

  const notes = useQuery(
    api.notes.getNotesByProject,
    resolvedParams ? { projectId: resolvedParams.id } : "skip"
  );

  const inspirations = useQuery(
    api.inspirations.getInspirationsByProject,
    resolvedParams ? { projectId: resolvedParams.id } : "skip"
  );

  // Initialize form when project loads
  React.useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || "");
    }
  }, [project]);

  const handleSave = async () => {
    if (!resolvedParams || !project) return;

    setIsSaving(true);
    try {
      await updateProject({
        id: resolvedParams.id as Id<"projects">,
        title: title.trim() || "Untitled Project",
        description: description.trim() || undefined,
      });
    } catch (error) {
      console.error("Failed to save project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!resolvedParams || !project) return;

    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        await deleteProject({ id: resolvedParams.id as Id<"projects"> });
        router.push("/dashboard/projects");
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [title, description]);

  if (!resolvedParams) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (project === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground text-center">
              The project you're looking for doesn't exist or has been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
              >
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Details */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project title..."
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project description..."
                  rows={4}
                />
              </div>
              <TagInput
                itemType="projects"
                itemId={project._id}
                currentTags={project.tags}
              />
            </CardContent>
          </Card>

          {/* Project Content */}
          <div className="space-y-4">
            {/* Scripts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Scripts ({scripts?.length || 0})
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Script
                </Button>
              </CardHeader>
              <CardContent>
                {scripts === undefined ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : scripts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No scripts in this project yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {scripts.map((script) => (
                      <div
                        key={script._id}
                        className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <Link
                            href={`/dashboard/scripts/${script._id}`}
                            className="font-medium hover:underline"
                          >
                            {script.title}
                          </Link>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(script.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Notes ({notes?.length || 0})
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardHeader>
              <CardContent>
                {notes === undefined ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : notes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No notes in this project yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div
                        key={note._id}
                        className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent"
                      >
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <Link
                            href={`/dashboard/notes/${note._id}`}
                            className="font-medium hover:underline"
                          >
                            {note.title}
                          </Link>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inspirations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Inspirations ({inspirations?.length || 0})
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inspiration
                </Button>
              </CardHeader>
              <CardContent>
                {inspirations === undefined ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : inspirations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No inspirations in this project yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {inspirations.map((inspiration) => (
                      <div
                        key={inspiration._id}
                        className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent"
                      >
                        <div className="flex items-center space-x-2">
                          {inspiration.type === "image" ? (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{inspiration.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(inspiration.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scripts:</span>
                <span>{scripts?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Notes:</span>
                <span>{notes?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Inspirations:</span>
                <span>{inspirations?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}