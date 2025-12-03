'use client' // Error boundaries must be Client Components
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Root error:', error)
  }, [error])

  const isDevelopment = process.env.NODE_ENV === 'development'
 
  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-background">
      <div className="max-w-lg w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Something went wrong!</h1>
          <p className="text-muted-foreground text-lg">
            We encountered an unexpected error. Please try again or return to the homepage.
          </p>
        </div>

        {error.digest && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              Error ID: <code className="font-mono">{error.digest}</code>
            </p>
          </div>
        )}

        {isDevelopment && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
              Error details (development only)
            </summary>
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-semibold mb-2">{error.message}</p>
              {error.stack && (
                <pre className="text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}