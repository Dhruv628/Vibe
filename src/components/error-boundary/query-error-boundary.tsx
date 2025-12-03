"use client";

import { ReactNode } from "react";
import { BaseErrorBoundary } from "./base-error-boundary";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import {
  classifyError,
  ErrorType,
  getErrorMessage,
  isRetryableError,
} from "./error-utils";

interface Props {
  children: ReactNode;
  onReset?: () => void;
  variant?: "default" | "minimal";
}

/**
 * Specialized ErrorBoundary for React Query/tRPC errors
 * Handles network errors, authentication errors, and data fetching failures
 */
export function QueryErrorBoundary({ children, onReset, variant = "default" }: Props) {
  return (
    <BaseErrorBoundary
      context={{ type: "query" }}
      onReset={onReset}
      fallback={(error, reset) => {
        const errorType = classifyError(error);
        const errorMessage = getErrorMessage(error, errorType);
        const canRetry = isRetryableError(errorType);

        if (variant === "minimal") {
            return (
                <div className="flex items-center justify-between p-2 border-b h-[52px] w-full bg-destructive/5 text-destructive px-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                         <AlertCircle className="h-4 w-4" />
                         <span>Error loading project</span>
                    </div>
                    {canRetry && (
                        <Button onClick={reset} variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                        </Button>
                    )}
                </div>
            )
        }

        return (
          <div className="flex items-center justify-center min-h-[300px] p-6">
            <div className="max-w-md w-full space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-3">
                  {errorType === ErrorType.NETWORK ? (
                    <WifiOff className="h-8 w-8 text-destructive" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {errorType === ErrorType.NETWORK
                    ? "Connection Error"
                    : "Failed to Load Data"}
                </h3>
                <p className="text-muted-foreground">{errorMessage}</p>
              </div>
              {canRetry && (
                <Button onClick={reset} variant="default" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </Button>
              )}
              {errorType === ErrorType.AUTHENTICATION && (
                <Button onClick={() => window.location.href = "/sign-in"} variant="default">
                  Sign in
                </Button>
              )}
            </div>
          </div>
        );
      }}
    >
      {children}
    </BaseErrorBoundary>
  );
}
