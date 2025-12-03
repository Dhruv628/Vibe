"use client";

import { ReactNode } from "react";
import { BaseErrorBoundary } from "./base-error-boundary";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  classifyError,
  ErrorType,
  getErrorMessage,
  isRetryableError,
} from "./error-utils";

interface Props {
  children: ReactNode;
  projectId?: string;
  onReset?: () => void;
}

/**
 * Context-specific ErrorBoundary for project-related components
 * Handles project not found, permission errors, etc.
 */
export function ProjectErrorBoundary({ children, projectId, onReset }: Props) {
  return (
    <BaseErrorBoundary
      context={{ type: "project", projectId }}
      onReset={onReset}
      fallback={(error, reset) => {
        const errorType = classifyError(error);
        const errorMessage = getErrorMessage(error, errorType);
        const canRetry = isRetryableError(errorType);

        // Custom message for project not found
        const displayMessage =
          errorType === ErrorType.NOT_FOUND
            ? "This project could not be found. It may have been deleted or you may not have access to it."
            : errorMessage;

        return (
          <div className="flex items-center justify-center min-h-screen p-6">
            <div className="max-w-md w-full space-y-6 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-4">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">
                  {errorType === ErrorType.NOT_FOUND
                    ? "Project Not Found"
                    : errorType === ErrorType.AUTHORIZATION
                    ? "Access Denied"
                    : "Something Went Wrong"}
                </h2>
                <p className="text-muted-foreground">{displayMessage}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetry && (
                  <Button onClick={reset} variant="default" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try again
                  </Button>
                )}
                <Button asChild variant={canRetry ? "outline" : "default"}>
                  <Link href="/" className="gap-2">
                    <Home className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      }}
    >
      {children}
    </BaseErrorBoundary>
  );
}
