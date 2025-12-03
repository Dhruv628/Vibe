import { TRPCClientError } from "@trpc/client";

/**
 * Error types for classification
 */
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION = "VALIDATION",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

/**
 * Classifies an error into a specific type
 */
export function classifyError(error: Error): ErrorType {
  // Check for tRPC errors
  if (error instanceof TRPCClientError) {
    const statusCode = error.data?.httpStatus;
    
    if (statusCode === 401) return ErrorType.AUTHENTICATION;
    if (statusCode === 403) return ErrorType.AUTHORIZATION;
    if (statusCode === 404) return ErrorType.NOT_FOUND;
    if (statusCode === 400 || statusCode === 422) return ErrorType.VALIDATION;
    if (statusCode && statusCode >= 500) return ErrorType.SERVER;
  }

  // Check for network errors
  if (
    error.message.includes("fetch") ||
    error.message.includes("network") ||
    error.message.includes("NetworkError")
  ) {
    return ErrorType.NETWORK;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Gets a user-friendly error message based on error type
 */
export function getErrorMessage(error: Error, errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return "Unable to connect. Please check your internet connection and try again.";
    case ErrorType.AUTHENTICATION:
      return "You need to be signed in to access this content.";
    case ErrorType.AUTHORIZATION:
      return "You don't have permission to access this content.";
    case ErrorType.NOT_FOUND:
      return "The requested content could not be found.";
    case ErrorType.VALIDATION:
      return "There was a problem with the request. Please try again.";
    case ErrorType.SERVER:
      return "Something went wrong on our end. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(errorType: ErrorType): boolean {
  return [ErrorType.NETWORK, ErrorType.SERVER, ErrorType.UNKNOWN].includes(
    errorType
  );
}

/**
 * Logs error to console in development, and optionally to error reporting service
 */
export function logError(
  error: Error,
  errorInfo?: { componentStack?: string },
  context?: Record<string, unknown>
) {
  if (process.env.NODE_ENV === "development") {
    console.error("Error caught by ErrorBoundary:", error);
    if (errorInfo?.componentStack) {
      console.error("Component stack:", errorInfo.componentStack);
    }
    if (context) {
      console.error("Error context:", context);
    }
  }

  // TODO: Integrate with error reporting service (e.g., Sentry)
  // Example:
  // Sentry.captureException(error, {
  //   contexts: { errorInfo, ...context },
  // });
}

/**
 * Gets error details for display (only in development)
 */
export function getErrorDetails(error: Error): string | null {
  if (process.env.NODE_ENV === "development") {
    return error.stack || error.message;
  }
  return null;
}
