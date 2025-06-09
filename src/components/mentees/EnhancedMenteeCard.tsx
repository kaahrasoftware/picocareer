
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  MapPin, 
  Star, 
  BookOpen, 
  Lightbulb,
  TrendingUp,
  Award,
  Calendar,
  Target,
  Code,
  FileText,
  Trophy,
  Users
} from 'lucide-react';

interface EnhancedMenteeCardProps {
  mentee: {
    id: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    school?: { name: string };
    academic_major?: { title: string };
    skills?: string[];
    fields_of_interest?: string[];
    academic_records?: Array<{
      semester_gpa?: number;
      cumulative_gpa?: number;
      year: number;
      semester: string;
      honors?: string[];
      awards?: string[];
    }>;
    projects?: Array<{
      title: string;
      status: string;
      technologies?: string[];
    }>;
    interests?: Array<{
      interest_name: string;
      category: string;
    }>;
  };
  onViewProfile: () => void;
}

export function EnhancedMenteeCard({ mentee, onViewProfile }: EnhancedMenteeCardProps) {
  const latestRecord = mentee.academic_records?.[0];
  const activeProjects = mentee.projects?.filter(p => p.status === 'in_progress')?.length || 0;
  const completedProjects = mentee.projects?.filter(p => p.status === 'completed')?.length || 0;
  const hasHonors = latestRecord?.honors && latestRecord.honors.length > 0;
  const hasAwards = latestRecord?.awards && latestRecord.awards.length > 0;
  const totalProjects = mentee.projects?.length || 0;

  // Calculate academic performance indicators
  const getGPAColor = (gpa?: number) => {
    if (!gpa) return 'text-muted-foreground';
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGPABgColor = (gpa?: number) => {
    if (!gpa) return 'bg-muted';
    if (gpa >= 3.5) return 'bg-green-50 border-green-200';
    if (gpa >= 3.0) return 'bg-blue-50 border-blue-200';
    if (gpa >= 2.5) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getProgressValue = (gpa?: number) => {
    if (!gpa) return 0;
    return (gpa / 4.0) * 100;
  };

  // Get most used technologies
  const allTechnologies = mentee.projects?.flatMap(p => p.technologies || []) || [];
  const techCounts = allTechnologies.reduce((acc, tech) => {
    acc[tech] = (acc[tech] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTechnologies = Object.entries(techCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([tech]) => tech);

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 border border-gray-200">
      {/* Achievement Indicator */}
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
        {(hasHonors || hasAwards || (latestRecord?.cumulative_gpa && latestRecord.cumulative_gpa >= 3.5)) && (
          <div className="absolute transform rotate-45 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold py-1 px-8 top-4 right-[-35px] shadow-lg">
            <Star className="h-3 w-3 mx-auto" />
          </div>
        )}
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <ProfileAvatar 
              avatarUrl={mentee.avatar_url} 
              imageAlt={mentee.full_name} 
              size="lg" 
              editable={false}
            />
            {/* Status indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <GraduationCap className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{mentee.full_name}</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <BookOpen className="h-3 w-3" />
                <span className="truncate">{mentee.academic_major?.title || 'Undecided'}</span>
              </div>
              {mentee.school?.name && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <GraduationCap className="h-3 w-3" />
                  <span className="truncate">{mentee.school.name}</span>
                </div>
              )}
              {mentee.location && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{mentee.location}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* GPA Display */}
          {latestRecord?.cumulative_gpa && (
            <div className={`px-3 py-2 rounded-lg border ${getGPABgColor(latestRecord.cumulative_gpa)}`}>
              <div className="text-center">
                <div className={`text-lg font-bold ${getGPAColor(latestRecord.cumulative_gpa)}`}>
                  {latestRecord.cumulative_gpa.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">GPA</div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        {mentee.bio && (
          <p className="text-sm text-gray-600 line-clamp-2">{mentee.bio}</p>
        )}

        {/* Academic Progress */}
        {latestRecord?.cumulative_gpa && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700">Academic Progress</span>
              <span className="text-gray-500">{latestRecord.year} {latestRecord.semester}</span>
            </div>
            <Progress 
              value={getProgressValue(latestRecord.cumulative_gpa)} 
              className="h-2"
            />
          </div>
        )}

        {/* Projects Summary */}
        {totalProjects > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Code className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Projects</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {totalProjects}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-1 text-green-700">
                <TrendingUp className="h-3 w-3" />
                <span>{activeProjects} Active</span>
              </div>
              <div className="flex items-center gap-1 text-blue-700">
                <Trophy className="h-3 w-3" />
                <span>{completedProjects} Done</span>
              </div>
            </div>
            {/* Top Technologies */}
            {topTechnologies.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {topTechnologies.map((tech, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-white/50 text-blue-700 border-blue-200">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Academic Achievements */}
        {(hasHonors || hasAwards) && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-100">
            <div className="flex items-center gap-1 mb-2">
              <Award className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Recent Achievements</span>
            </div>
            <div className="space-y-2">
              {hasHonors && (
                <div>
                  <div className="flex flex-wrap gap-1">
                    {latestRecord.honors?.slice(0, 2).map((honor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                        {honor}
                      </Badge>
                    ))}
                    {latestRecord.honors && latestRecord.honors.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{latestRecord.honors.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {hasAwards && (
                <div>
                  <div className="flex flex-wrap gap-1">
                    {latestRecord.awards?.slice(0, 2).map((award, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        {award}
                      </Badge>
                    ))}
                    {latestRecord.awards && latestRecord.awards.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{latestRecord.awards.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills & Interests Row */}
        <div className="grid grid-cols-1 gap-3">
          {mentee.skills && mentee.skills.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Target className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-gray-700">Skills</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {mentee.skills.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {skill}
                  </Badge>
                ))}
                {mentee.skills.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{mentee.skills.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {mentee.interests && mentee.interests.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Lightbulb className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-medium text-gray-700">Interests</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {mentee.interests.slice(0, 3).map((interest, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    {interest.interest_name}
                  </Badge>
                ))}
                {mentee.interests.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{mentee.interests.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          onClick={onViewProfile}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-200 group-hover:scale-[1.02]"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Full Profile
        </Button>
      </CardContent>
    </Card>
  );
}
