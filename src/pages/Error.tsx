
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home, RefreshCw, MessageCircle, Target } from "lucide-react";

export default function ErrorPage() {
  const error = useRouteError();
  
  let errorMessage = "Something unexpected happened on your career journey.";
  let errorCode = "500";
  let errorDetails = "We're working to get you back on track.";
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || "An error occurred";
    errorCode = error.status.toString();
    
    // Customize messages based on error type
    switch (error.status) {
      case 404:
        errorMessage = "This career path doesn't exist";
        errorDetails = "The page you're looking for might have been moved or doesn't exist.";
        break;
      case 403:
        errorMessage = "Access to this career resource is restricted";
        errorDetails = "You don't have permission to view this page.";
        break;
      case 500:
        errorMessage = "Our career guidance system encountered an issue";
        errorDetails = "We're working to resolve this technical difficulty.";
        break;
      default:
        errorDetails = "Let's get you back to exploring your career opportunities.";
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = "We've encountered a technical issue that's preventing this page from loading.";
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#00A6D4] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{errorCode}</span>
                </div>
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-[#012169] mb-2">
              {errorMessage}
            </CardTitle>
            <p className="text-gray-600 text-lg">
              {errorDetails}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleRefresh}
                className="bg-[#00A6D4] hover:bg-[#0EA5E9] text-white font-medium"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Button asChild variant="outline" className="border-[#012169] text-[#012169] hover:bg-[#012169] hover:text-white">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="border-t pt-6">
              <h3 className="text-center text-sm font-medium text-gray-700 mb-4">
                Or continue exploring:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Button asChild variant="ghost" size="sm" className="text-[#00A6D4] hover:bg-[#00A6D4] hover:text-white">
                  <Link to="/careers">
                    <Target className="mr-1 h-3 w-3" />
                    Careers
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" size="sm" className="text-[#00A6D4] hover:bg-[#00A6D4] hover:text-white">
                  <Link to="/mentor">
                    Mentors
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" size="sm" className="text-[#00A6D4] hover:bg-[#00A6D4] hover:text-white">
                  <Link to="/career-assessment">
                    Assessment
                  </Link>
                </Button>
              </div>
            </div>

            {/* Support */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">
                Need help? Our career guidance team is here for you.
              </p>
              <Button asChild variant="ghost" size="sm" className="text-[#00A6D4] hover:bg-[#00A6D4] hover:text-white">
                <Link to="/about">
                  <MessageCircle className="mr-1 h-3 w-3" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PicoCareer Branding */}
        <div className="text-center mt-6">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold text-[#012169] hover:text-[#00A6D4] transition-colors">
              PicoCareer
            </h1>
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            Your Career Journey Continues
          </p>
        </div>
      </div>
    </div>
  );
}
