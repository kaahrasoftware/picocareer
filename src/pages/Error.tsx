import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  
  let errorMessage = "An unexpected error has occurred.";
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || "An error occurred";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div id="error-page" className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Oops!</h1>
        <p className="text-lg mb-2">Sorry, an unexpected error has occurred.</p>
        <p className="text-gray-600">
          <i>{errorMessage}</i>
        </p>
      </div>
    </div>
  );
}