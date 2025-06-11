import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { 
  GraduationCap, 
  MapPin, 
  Star, 
  BookOpen, 
  Lightbulb,
  TrendingUp,
  Award
} from 'lucide-react';

interface MenteeCardProps {
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

export function MenteeCard({ mentee, onViewProfile }: MenteeCardProps) {
  const latestRecord = mentee.academic_records?.[0];
  const activeProjects = mentee.projects?.filter(p => p.status === 'in_progress')?.length || 0;
  const completedProjects = mentee.projects?.filter(p => p.status === 'completed')?.length || 0;
  const hasHonors = latestRecord?.honors && latestRecord.honors.length > 0;
  const hasAwards = latestRecord?.awards && latestRecord.awards.length > 0;

  const getGPAColor = (gpa?: number) => {
    if (!gpa) return 'text-gray-500';
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGPABgColor = (gpa?: number) => {
    if (!gpa) return 'bg-gray-50';
    if (gpa >= 3.5) return 'bg-green-50';
    if (gpa >= 3.0) return 'bg-blue-50';
    if (gpa >= 2.5) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ProfileAvatar 
                avatarUrl={mentee.avatar_url} 
                imageAlt={mentee.full_name} 
                size="lg"
                userId={mentee.id}
                editable={false}
              />
              {(hasHonors || hasAwards) && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <Award className="h-3 w-3 text-yellow-700" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{mentee.full_name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <GraduationCap className="h-3 w-3" />
                <span>{mentee.academic_major?.title || 'Undecided'}</span>
              </div>
              {mentee.school?.name && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <BookOpen className="h-3 w-3" />
                  <span>{mentee.school.name}</span>
                </div>
              )}
            </div>
          </div>
          
          {latestRecord?.cumulative_gpa && (
            <div className={`${getGPABgColor(latestRecord.cumulative_gpa)} px-3 py-1 rounded-full`}>
              <div className="flex items-center gap-1">
                <Star className={`h-3 w-3 ${getGPAColor(latestRecord.cumulative_gpa)}`} />
                <span className={`text-sm font-semibold ${getGPAColor(latestRecord.cumulative_gpa)}`}>
                  {latestRecord.cumulative_gpa.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {mentee.bio && (
          <p className="text-sm text-gray-600 line-clamp-2">{mentee.bio}</p>
        )}

        {mentee.location && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span>{mentee.location}</span>
          </div>
        )}

        {(hasHonors || hasAwards) && (
          <div className="space-y-2">
            {hasHonors && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Recent Honors</h4>
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
                <h4 className="text-xs font-medium text-gray-700 mb-1">Recent Awards</h4>
                <div className="flex flex-wrap gap-1">
                  {latestRecord.awards?.slice(0, 2).map((award, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
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
        )}

        {(activeProjects > 0 || completedProjects > 0) && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-blue-600">
                <TrendingUp className="h-3 w-3" />
                <span>{activeProjects} Active</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <Award className="h-3 w-3" />
                <span>{completedProjects} Completed</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {mentee.skills && mentee.skills.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {mentee.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {skill}
                  </Badge>
                ))}
                {mentee.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{mentee.skills.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {mentee.interests && mentee.interests.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Interests</h4>
              <div className="flex flex-wrap gap-1">
                {mentee.interests.slice(0, 3).map((interest, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Lightbulb className="h-2 w-2 mr-1" />
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

        <Button 
          onClick={onViewProfile}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          View Full Profile
        </Button>
      </CardContent>
    </Card>
  );
}
