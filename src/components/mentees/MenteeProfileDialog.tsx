
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, GraduationCap, Building, MapPin, Calendar, Star, User, BookOpen, Trophy, Target } from "lucide-react";
import { BookSessionDialog } from "../BookSessionDialog";
import { useAuthSession } from "@/hooks/useAuthSession";

interface MenteeProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  school_id: string;
  academic_major_id: string;
  skills: string[];
  fields_of_interest: string[];
  user_type: 'admin' | 'mentor' | 'mentee' | 'editor';
  created_at: string;
  schools: {
    name: string;
  };
  majors: {
    title: string;
  };
}

interface MenteeProfileDialogProps {
  mentee: MenteeProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenteeProfileDialog({ mentee, open, onOpenChange }: MenteeProfileDialogProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const { session } = useAuthSession();

  const handleBookSession = () => {
    if (!session?.user) {
      // Handle authentication requirement
      return;
    }
    setBookingOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mentee.avatar_url} alt={mentee.full_name} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{mentee.full_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {mentee.majors?.title || 'Major not specified'}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-6">
              {/* Basic Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mentee.bio && (
                    <p className="text-sm">{mentee.bio}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{mentee.majors?.title || 'Major not specified'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{mentee.schools?.name || 'School not specified'}</span>
                    </div>
                    
                    {mentee.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{mentee.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {formatDate(mentee.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="skills" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="skills">Skills & Interests</TabsTrigger>
                  <TabsTrigger value="academic">Academic Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="skills" className="space-y-4">
                  {/* Skills */}
                  {mentee.skills && mentee.skills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {mentee.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Fields of Interest */}
                  {mentee.fields_of_interest && mentee.fields_of_interest.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Fields of Interest
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {mentee.fields_of_interest.map((interest, index) => (
                            <Badge key={index} variant="outline">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Academic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm">Major</h4>
                          <p className="text-sm text-muted-foreground">
                            {mentee.majors?.title || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">School</h4>
                          <p className="text-sm text-muted-foreground">
                            {mentee.schools?.name || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleBookSession} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Book Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BookSessionDialog
        mentor={{
          id: mentee.id,
          name: mentee.full_name,
          imageUrl: mentee.avatar_url
        }}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </>
  );
}
