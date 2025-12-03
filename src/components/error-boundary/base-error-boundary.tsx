"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { logError, getErrorDetails } from "./error-utils";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: { componentStack?: string }) => void;
  onReset?: () => void;
  context?: Record<string, unknown>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Base ErrorBoundary component with customizable fallback UI
 * Provides error logging and retry functionality
 */
export class BaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string }) {
    // Log error
    logError(error, errorInfo, this.props.context);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallback UI
      const errorDetails = getErrorDetails(this.state.error);

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="max-w-md w-full space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Something went wrong</h2>
              <p className="text-muted-foreground">
                An unexpected error occurred. Please try again.
              </p>
            </div>
            {errorDetails && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Error details
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                  {errorDetails}
                </pre>
              </details>
            )}
            <Button onClick={this.reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
