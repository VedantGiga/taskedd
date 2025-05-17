import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
            The page you're looking for doesn't exist or you may have been redirected incorrectly.
          </p>
          
          <Button 
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
