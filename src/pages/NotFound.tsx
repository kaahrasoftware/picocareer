
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Home, Users, Target, GraduationCap, ArrowLeft, MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="w-full max-w-4xl">
        {/* Main 404 Content */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-[#00A6D4] mb-4">404</h1>
            <h2 className="text-3xl font-semibold text-[#012169] mb-4">
              Oops! This Career Path Doesn't Exist
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              The page you're looking for seems to have taken a different career direction.
            </p>
            <p className="text-gray-500">
              Don't worry though - we have plenty of other amazing opportunities to explore!
            </p>
          </div>

          {/* Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              <MapPin className="h-32 w-32 text-[#00A6D4] opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="h-16 w-16 text-[#012169]" />
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild className="bg-[#00A6D4] hover:bg-[#0EA5E9] text-white px-8 py-3 text-lg">
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-[#00A6D4] text-[#00A6D4] hover:bg-[#00A6D4] hover:text-white px-8 py-3 text-lg">
              <Link to="/career-assessment">
                <Target className="mr-2 h-5 w-5" />
                Take Assessment
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-[#00A6D4]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-[#012169] text-lg">
                <Target className="mr-2 h-5 w-5 text-[#00A6D4]" />
                Careers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">
                Explore thousands of career opportunities
              </p>
              <Button asChild variant="ghost" className="text-[#00A6D4] hover:bg-[#00A6D4] hover:text-white p-0 h-auto">
                <Link to="/careers">
                  Explore Careers <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-[#00A6D4]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-[#012169] text-lg">
                <Users className="mr-2 h-5 w-5 text-[#00A6D4]" />
                Mentors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">
                Connect with industry experts
              </p>
              <Button asChild variant="ghost" className="text-[#00A6D4] hover:bg-[#00A6D4] hover:text-white p-0 h-auto">
                <Link to="/mentor">
                  Find Mentors <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-[#00A6D4]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-[#012169] text-lg">
                <GraduationCap className="mr-2 h-5 w-5 text-[#00A6D4]" />
                Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">
                Discover academic pathways
              </p>
              <Button asChild variant="ghost" className="text-[#00A6D4] hover:bg-[#00A6D4] hover:text-white p-0 h-auto">
                <Link to="/program">
                  View Programs <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-[#00A6D4]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-[#012169] text-lg">
                <Search className="mr-2 h-5 w-5 text-[#00A6D4]" />
                Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">
                Find what you're looking for
              </p>
              <Button asChild variant="ghost" className="text-[#00A6D4] hover:bg-[#00A6D4] hover:text-white p-0 h-auto">
                <Link to="/">
                  Start Search <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer Message */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Still can't find what you're looking for?{' '}
            <Link to="/about" className="text-[#00A6D4] hover:underline">
              Contact us
            </Link>{' '}
            and we'll help you navigate your career journey.
          </p>
        </div>
      </div>
    </div>
  );
}
