import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary">Posta</h1>
            <span className="text-sm text-muted-foreground">Content Creator&apos;s Hub</span>
          </div>
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Your Content Ideas, Organized
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            A Notion-inspired productivity tool designed specifically for solo content creators. 
            Transform your idea overload into actionable projects.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Creating
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                Go to Dashboard
              </Button>
            </Link>
          </SignedIn>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Command-Driven</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Use Cmd+K palette and slash commands to quickly create projects, scripts, and notes. 
                Navigate at the speed of thought.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔗</span>
                <span>Smart Sources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Add YouTube videos, Instagram posts, and other content sources. 
                Auto-generate previews and keep everything organized.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📝</span>
                <span>Block-Based Editing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Notion-like editing experience with drag-and-drop blocks. 
                Mix notes, scripts, images, and links seamlessly.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
