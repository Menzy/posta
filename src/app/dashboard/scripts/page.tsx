"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ScriptsPage() {
  const scripts = useQuery(api.scripts.getScripts, {});
  const createScript = useMutation(api.scripts.createScript);

  const handleCreateScript = async () => {
    const title = `New Script ${new Date().toLocaleDateString()}`;
    await createScript({ title });
  };

  if (scripts === undefined) {
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
          <h1 className="text-3xl font-bold">Scripts</h1>
          <p className="text-muted-foreground">
            All your content scripts in one place
          </p>
        </div>
        <Button onClick={handleCreateScript}>
          <Plus className="h-4 w-4 mr-2" />
          New Script
        </Button>
      </div>

      {scripts && scripts.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scripts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first script to start writing content
            </p>
            <Button onClick={handleCreateScript}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Script
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scripts?.map((script) => (
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
                  <CardDescription className="line-clamp-2 mt-1">
                    {script.projectId ? "In project" : "Uncategorized"}
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {script.content.length} blocks
                  </span>
                  <span>
                    {new Date(script.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {script.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {script.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {script.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                        +{script.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}