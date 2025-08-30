import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="max-w-md text-center shadow-lg bg-white dark:bg-gray-800">
        <CardContent className="py-12 px-6">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">404 Not Found</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Oops! The page you are looking for does not exist.
          </p>
          <Button
            variant="default"
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
          >
            Go Back Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

