"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Inbox, FileText, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InboxPage() {
  const uncategorizedScripts = useQuery(api.scripts.getUncategorizedScripts);
  const createScript = useMutation(api.scripts.createScript);

  const handleCreateScript = async () => {
    const title = `New Script ${new Date().toLocaleDateString()}`;
    await createScript({ title });
  };

  if (uncategorizedScripts === undefined) {
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
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-muted-foreground">
            Uncategorized scripts waiting to be organized
          </p>
        </div>
        <Button onClick={handleCreateScript}>
          <Plus className="h-4 w-4 mr-2" />
          Quick Add
        </Button>
      </div>

      {uncategorizedScripts.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inbox is empty</h3>
            <p className="text-muted-foreground text-center mb-4">
              All your scripts are organized! Create a new one or check back later.
            </p>
            <Button onClick={handleCreateScript}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Script
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {uncategorizedScripts.map((script) => (
            <Card key={script._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-base line-clamp-1">
                    <Link 
                      href={`/dashboard/scripts/${script._id}`}
                      className="hover:underline"
                    >
                      {script.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1 flex items-center">
                    <Inbox className="h-3 w-3 mr-1" />
                    Needs organization
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/scripts/${script._id}`}>
                        Edit Script
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Move to Project
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Add Tags
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    {script.content.length} blocks
                  </span>
                  <span>
                    {new Date(script.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Preview of first content block */}
                {script.content.length > 0 && script.content[0].content && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {script.content[0].content}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    Organize
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs">
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}