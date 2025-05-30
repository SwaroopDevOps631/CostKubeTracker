import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { LoadingSpinner } from "./loading-spinner";
import { ErrorDisplay } from "./error-display";

interface DataCardProps {
  title: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: ReactNode;
}

export function DataCard({ 
  title, 
  isLoading = false, 
  error = null, 
  onRetry,
  children 
}: DataCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorDisplay 
            message={error.message || "Failed to load data"} 
            onRetry={onRetry} 
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}