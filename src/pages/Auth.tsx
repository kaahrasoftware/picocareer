
import React from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Users, TrendingUp, Target, Star, ArrowRight } from 'lucide-react';

export default function Auth() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00A6D4] via-[#0EA5E9] to-[#012169] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-32 left-32 w-20 h-20 border border-white/20 rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">PicoCareer</h1>
            <div className="w-16 h-1 bg-white/80 mt-2"></div>
          </div>

          {/* Main Headline */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold mb-4 leading-tight">
              Your Career Journey<br />
              Starts Here
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Discover your perfect career path with AI-powered assessments, 
              connect with expert mentors, and unlock opportunities that align 
              with your passions and skills.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-white/90">AI-powered career assessments</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-white/90">Connect with industry mentors</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-white/90">Explore career opportunities</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-white/90">Discover academic pathways</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm text-white/80">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-white/80">Expert Mentors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1K+</div>
              <div className="text-sm text-white/80">Career Paths</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-[#012169] mb-2">PicoCareer</h1>
            <p className="text-gray-600">Your Career Journey Starts Here</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-[#012169] mb-2">
                Welcome Back
              </CardTitle>
              <p className="text-gray-600">
                Sign in to continue your career journey
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                  <TabsTrigger 
                    value="signin" 
                    className="text-gray-700 data-[state=active]:bg-[#00A6D4] data-[state=active]:text-white transition-all duration-200"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="text-gray-700 data-[state=active]:bg-[#00A6D4] data-[state=active]:text-white transition-all duration-200"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <SignInForm />
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <SignUpForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-600">
            <p>
              By continuing, you agree to our{' '}
              <a href="#" className="text-[#00A6D4] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#00A6D4] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
