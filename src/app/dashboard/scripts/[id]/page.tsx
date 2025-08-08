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
  FileText, 
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

interface ScriptEditorPageProps {
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

export default function ScriptEditorPage({ params }: ScriptEditorPageProps) {
  return <ScriptEditorClient params={params} />;
}

function ScriptEditorClient({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const scriptId = resolvedParams?.id as Id<"scripts"> | undefined;
  const script = useQuery(api.scripts.getScript, scriptId ? { id: scriptId } : "skip");
  const updateScript = useMutation(api.scripts.updateScript);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<BlockContent[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const currentScript = script;

  const handleSave = useCallback(async () => {
    if (!currentScript || !scriptId) return;
    
    setIsSaving(true);
    try {
      await updateScript({
        id: scriptId,
        title,
        content,
      });
    } catch (error) {
      console.error('Failed to save script:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentScript, title, content, scriptId, updateScript]);

  const handleContentChange = (newContent: BlockContent[]) => {
    setContent(newContent);
  };

  useEffect(() => {
    if (currentScript) {
      setTitle(currentScript.title);
      setContent(currentScript.content);
    }
  }, [currentScript]);

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

  if (!resolvedParams || script === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentScript) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/scripts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scripts
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Script not found</h3>
          <p className="text-muted-foreground text-center mb-4">
            This script might have been deleted or you don&apos;t have access to it.
          </p>
          <Link href="/dashboard/scripts">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scripts
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
        <Link href="/dashboard/scripts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scripts
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
                Delete Script
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Script metadata */}
      <div className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Script"
          className="text-2xl font-bold border-none px-0 shadow-none focus-visible:ring-0"
        />
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Updated {new Date(currentScript.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>{content.length} blocks</span>
          </div>
        </div>

        {currentScript.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentScript.tags.map((tag) => (
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
          placeholder="Start writing your script... Type '/' for commands"
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