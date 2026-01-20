import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorPanelProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorPanel({ title = "Error", message, onRetry }: ErrorPanelProps) {
  return (
    <Alert variant="destructive" className="my-4" data-testid="error-panel">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle data-testid="text-error-title">{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span data-testid="text-error-message">{message}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-retry">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
