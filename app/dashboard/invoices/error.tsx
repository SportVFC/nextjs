// "use client" - error.tsx needs to be a Client Component.
'use client';
 
import { useEffect } from 'react';

/*
It accepts two props:
- error: This object is an instance of JavaScript's native Error object.
- reset: This is a function to reset the error boundary. When executed, the 
         function will try to re-render the route segment.


For example, visit http://localhost:3000/dashboard/invoices/2e94d1ed-d220-449f-9f11-f0bbceed9645/edit.
This is a fake UUID that doesn't exist in your database.
You'll immediately see error.tsx kicks in because this is a child route of /invoices where error.tsx is defined.
However, if you want to be more specific, you can show a 404 error to tell the user the resource they're trying to 
access hasn't been found.
*/
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);
 
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Attempt to recover by trying to re-render the invoices route
          () => reset()
        }
      >
        Try again
      </button>
    </main>
  );
}