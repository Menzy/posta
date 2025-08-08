"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  Home,
  FolderOpen,
  FileText,
  BookOpen,
  Link as LinkIcon,
  Image as ImageIcon,
  Inbox,
  Search,
  Settings,
  Plus,
  Tag as TagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Projects", url: "/dashboard/projects", icon: FolderOpen },
  { title: "Scripts", url: "/dashboard/scripts", icon: FileText },
  { title: "Notes", url: "/dashboard/notes", icon: BookOpen },
  { title: "Inspirations", url: "/dashboard/inspirations", icon: LinkIcon },
  { title: "Images", url: "/dashboard/images", icon: ImageIcon },
  { title: "Tags", url: "/dashboard/tags", icon: TagIcon },
  { title: "Inbox", url: "/dashboard/inbox", icon: Inbox },
];

export function AppSidebar() {
  const projects = useQuery(api.projects.getProjects);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-4 py-2">
          <h1 className="text-xl font-bold text-primary">Posta</h1>
          <span className="text-xs text-muted-foreground">Content Hub</span>
        </div>
        <div className="px-4 pb-2">
          <Button size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            Recent Projects
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Plus className="h-3 w-3" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects === undefined ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <div className="h-4 w-4 animate-pulse bg-muted rounded" />
                    <span className="h-4 bg-muted rounded animate-pulse">Loading...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : projects.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">No projects</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                projects.slice(0, 5).map((project) => (
                  <SidebarMenuItem key={project._id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/dashboard/projects/${project._id}`}>
                        <FolderOpen className="h-4 w-4" />
                        <span className="truncate">{project.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/search">
                <Search className="h-4 w-4" />
                <span>Search</span>
                <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                  ⌘K
                </kbd>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center px-2 py-1.5">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-6 w-6",
                  },
                }}
              />
              <span className="ml-2 text-sm font-medium">Account</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}