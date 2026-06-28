import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
          <div className="rounded-full bg-red-100 p-4 mb-6 dark:bg-red-900/20">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">404</h1>
          <h2 className="text-xl font-medium text-foreground mb-4">Page not found</h2>
          <p className="text-muted-foreground mb-8 max-w-xs">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <Button size="lg" className="w-full md:w-auto px-8 font-semibold">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
