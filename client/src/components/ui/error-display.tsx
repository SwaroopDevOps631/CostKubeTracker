import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ 
  message = "An error occurred while fetching data", 
  onRetry 
}: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center justify-center space-y-3">
      <div className="flex items-center space-x-2 text-red-700">
        <AlertCircle className="h-5 w-5" />
        <p className="font-medium">{message}</p>
      </div>
      
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}