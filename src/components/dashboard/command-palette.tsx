"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Calculator,
  Settings,
  FileText,
  FolderOpen,
  BookOpen,
  Link as LinkIcon,
  Image as ImageIcon,
  Plus,
  Search,
  Inbox,
  Tag as TagIcon,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  
  const projects = useQuery(api.projects.getProjects);
  const createProject = useMutation(api.projects.createProject);
  const createScript = useMutation(api.scripts.createScript);
  const createNote = useMutation(api.notes.createNote);
  const createInspiration = useMutation(api.inspirations.createInspiration);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleCreateProject = async () => {
    const title = `New Project ${new Date().toLocaleDateString()}`;
    const projectId = await createProject({ title });
    router.push(`/dashboard/projects/${projectId}`);
    setOpen(false);
  };

  const handleCreateScript = async () => {
    const title = `New Script ${new Date().toLocaleDateString()}`;
    const scriptId = await createScript({ title });
    router.push(`/dashboard/scripts/${scriptId}`);
    setOpen(false);
  };

  const handleCreateNote = async () => {
    const title = `New Note ${new Date().toLocaleDateString()}`;
    const noteId = await createNote({ title });
    router.push(`/dashboard/notes/${noteId}`);
    setOpen(false);
  };

  const handleCreateInspiration = async () => {
    const title = `New Inspiration ${new Date().toLocaleDateString()}`;
    await createInspiration({ title, type: "link" });
    router.push("/dashboard/inspirations");
    setOpen(false);
  };

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={handleCreateProject}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Project</span>
            </CommandItem>
            <CommandItem onSelect={handleCreateScript}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Create New Script</span>
            </CommandItem>
            <CommandItem onSelect={handleCreateNote}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Create New Note</span>
            </CommandItem>
            <CommandItem onSelect={handleCreateInspiration}>
              <LinkIcon className="mr-2 h-4 w-4" />
              <span>Add New Inspiration</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <Calculator className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/projects"))}>
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>All Projects</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/scripts"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>All Scripts</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/notes"))}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>All Notes</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/inspirations"))}>
              <LinkIcon className="mr-2 h-4 w-4" />
              <span>All Inspirations</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/images"))}>
              <ImageIcon className="mr-2 h-4 w-4" />
              <span>Image Gallery</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/tags"))}>
              <TagIcon className="mr-2 h-4 w-4" />
              <span>Tags</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/inbox"))}>
              <Inbox className="mr-2 h-4 w-4" />
              <span>Inbox</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {projects && projects.length > 0 && (
            <>
              <CommandGroup heading="Recent Projects">
                {projects.slice(0, 5).map((project) => (
                  <CommandItem 
                    key={project._id} 
                    onSelect={() => runCommand(() => router.push(`/dashboard/projects/${project._id}`))}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>{project.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/search"))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Search Everything</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}