
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Users, GraduationCap, TrendingUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { School } from '@/types/database/schools';

interface ModernSchoolCardProps {
  school: School;
}

export function ModernSchoolCard({ school }: ModernSchoolCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/schools/${school.id}`);
  };

  return (
    <Card className="group overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50/50">
      <div className="relative">
        {school.cover_image_url ? (
          <div className="w-full h-48 overflow-hidden relative">
            <img
              src={school.cover_image_url}
              alt={school.name}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <GraduationCap className="w-16 h-16 text-blue-500/30" />
          </div>
        )}
        
        {school.logo_url && (
          <div className="absolute -bottom-6 left-6">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-3 border-white bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <img
                src={school.logo_url}
                alt={`${school.name} logo`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
        
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/90 text-gray-700 hover:bg-white border-0 shadow-sm">
            <MapPin className="h-3 w-3 mr-1" />
            {school.location || school.country}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 flex-1 flex flex-col pt-8">
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 mb-2">
              {school.name}
            </h3>
            <Badge variant="outline" className="capitalize text-xs bg-blue-50 text-blue-700 border-blue-200">
              {school.type || 'University'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {school.acceptance_rate && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Acceptance</span>
                </div>
                <p className="font-semibold text-green-800">
                  {Math.round(school.acceptance_rate * 100)}%
                </p>
              </div>
            )}
            
            {school.ranking && (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">Ranking</span>
                </div>
                <p className="font-semibold text-yellow-800">#{school.ranking}</p>
              </div>
            )}
            
            {school.student_faculty_ratio && (
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Student-Faculty Ratio</span>
                </div>
                <p className="font-semibold text-purple-800">{school.student_faculty_ratio}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button 
            onClick={handleViewDetails}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {school.website && (
            <Button
              variant="outline"
              size="icon"
              asChild
              className="border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <a href={school.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
