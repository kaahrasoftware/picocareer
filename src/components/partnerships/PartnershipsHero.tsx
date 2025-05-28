
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Target, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PartnershipsHero() {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-purple-200">
            <Handshake className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-purple-700 font-medium">Partnership Opportunities</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Partner with{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PicoCareer
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join our mission to transform career guidance and education. Partner with us to provide 
            your students, members, or employees with cutting-edge career development tools and personalized mentorship.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/partnerships/apply">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                Start Partnership Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3">
              Learn More
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-purple-200">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">500+ Partners</h3>
              <p className="text-gray-600 text-sm">Educational institutions and organizations worldwide</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-purple-200">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1M+ Students</h3>
              <p className="text-gray-600 text-sm">Career guidance provided through partnerships</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-purple-200">
                <Handshake className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">98% Satisfaction</h3>
              <p className="text-gray-600 text-sm">Partner satisfaction rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
