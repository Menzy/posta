"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { BlockEditor } from "@/components/editor/block-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  MoreHorizontal, 
  BookOpen, 
  Calendar,
  Tag
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteEditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface BlockContent {
  id: string;
  type: 'text' | 'heading' | 'bullet' | 'divider' | 'code' | 'quote';
  content: string;
  metadata?: Record<string, unknown>;
}

export default function NoteEditorPage({ params }: NoteEditorPageProps) {
  return <NoteEditorClient params={params} />;
}

function NoteEditorClient({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const noteId = resolvedParams?.id as Id<"notes"> | undefined;
  const note = useQuery(api.notes.getNote, noteId ? { id: noteId } : "skip");
  const updateNote = useMutation(api.notes.updateNote);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<BlockContent[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const currentNote = note;

  const handleSave = useCallback(async () => {
    if (!currentNote || !noteId) return;
    
    setIsSaving(true);
    try {
      await updateNote({
        id: noteId,
        title,
        content,
      });
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentNote, title, content, noteId, updateNote]);

  const handleContentChange = (newContent: BlockContent[]) => {
    setContent(newContent);
  };

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    }
  }, [currentNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (!resolvedParams || note === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentNote) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/notes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Note not found</h3>
          <p className="text-muted-foreground text-center mb-4">
            This note might have been deleted or you don&apos;t have access to it.
          </p>
          <Link href="/dashboard/notes">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/notes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Tag className="h-4 w-4 mr-2" />
                Add Tags
              </DropdownMenuItem>
              <DropdownMenuItem>
                Move to Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Note metadata */}
      <div className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="text-2xl font-bold border-none px-0 shadow-none focus-visible:ring-0"
        />
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Updated {new Date(currentNote.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{content.length} blocks</span>
          </div>
        </div>

        {currentNote.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentNote.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <BlockEditor
          initialContent={content}
          onChange={handleContentChange}
          placeholder="Start writing your note... Type '/' for commands"
        />
      </div>

      {/* Tips */}
      <div className="border-t pt-4">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘ + S</kbd>
            <span>Save</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">/</kbd>
            <span>Open command menu</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘ + K</kbd>
            <span>Quick actions</span>
          </div>
        </div>
      </div>
    </div>
  );
}