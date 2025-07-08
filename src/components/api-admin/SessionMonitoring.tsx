import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Activity, Clock, Users, Search, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Session {
  id: string;
  organization_id: string;
  api_user_id: string;
  template_id?: string;
  session_token: string;
  is_active: boolean;
  started_at?: string;
  completed_at?: string;
  expires_at: string;
  current_question_index?: number;
  progress_data?: any;
  last_activity_at?: string;
  client_metadata?: any;
  api_organizations?: {
    name: string;
  };
  api_users?: {
    external_user_id: string;
  };
  api_assessment_templates?: {
    name: string;
  };
}

interface SessionStats {
  total: number;
  active: number;
  completed: number;
  expired: number;
  avgCompletionTime: number;
  completionRate: number;
}

export function SessionMonitoring() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('api_assessment_sessions')
        .select(`
          *,
          api_organizations!inner(name),
          api_users!inner(external_user_id),
          api_assessment_templates(name)
        `)
        .order('last_activity_at', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;

      setSessions(sessionsData || []);
      
      // Calculate stats
      const now = new Date();
      const activeSessions = sessionsData?.filter(s => s.is_active && new Date(s.expires_at) > now) || [];
      const completedSessions = sessionsData?.filter(s => s.completed_at) || [];
      const expiredSessions = sessionsData?.filter(s => !s.is_active || new Date(s.expires_at) <= now) || [];
      
      const completionTimes = completedSessions
        .filter(s => s.started_at && s.completed_at)
        .map(s => new Date(s.completed_at!).getTime() - new Date(s.started_at!).getTime());
      
      const avgCompletionTime = completionTimes.length > 0 
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length / 1000 / 60 // minutes
        : 0;

      const completionRate = sessionsData && sessionsData.length > 0 
        ? (completedSessions.length / sessionsData.length) * 100 
        : 0;

      setStats({
        total: sessionsData?.length || 0,
        active: activeSessions.length,
        completed: completedSessions.length,
        expired: expiredSessions.length,
        avgCompletionTime,
        completionRate
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch session data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSessionStatus = (session: Session) => {
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (session.completed_at) return 'completed';
    if (!session.is_active || expiresAt <= now) return 'expired';
    if (session.started_at) return 'active';
    return 'created';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'created': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (session: Session) => {
    if (!session.progress_data || !session.api_assessment_templates) return 0;
    
    // This would need template data to calculate actual progress
    // For now, use current_question_index as approximation
    return session.current_question_index ? Math.min(session.current_question_index * 10, 100) : 0;
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchTerm || 
      session.api_organizations?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.api_users?.external_user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.session_token.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || getSessionStatus(session) === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex justify-center py-8">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <div className="text-xs text-muted-foreground">
                Currently in progress
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
              <Progress value={stats.completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.avgCompletionTime)}m</div>
              <div className="text-xs text-muted-foreground">
                Average time to complete
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-4 items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="created">Created</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={fetchSessions} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Sessions ({filteredSessions.length})
          </h3>
        </div>

        <div className="grid gap-4">
          {filteredSessions.map((session) => {
            const status = getSessionStatus(session);
            const progress = calculateProgress(session);
            
            return (
              <Card key={session.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">
                      {session.api_organizations?.name || 'Unknown Org'}
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(status)}>
                      {status}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSession(session)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Session Details</DialogTitle>
                          <DialogDescription>
                            Detailed information about this assessment session
                          </DialogDescription>
                        </DialogHeader>
                        {selectedSession && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>Session ID:</strong> {selectedSession.id}</div>
                              <div><strong>Status:</strong> {getSessionStatus(selectedSession)}</div>
                              <div><strong>Organization:</strong> {selectedSession.api_organizations?.name}</div>
                              <div><strong>User ID:</strong> {selectedSession.api_users?.external_user_id}</div>
                              <div><strong>Template:</strong> {selectedSession.api_assessment_templates?.name || 'None'}</div>
                              <div><strong>Created:</strong> {new Date(selectedSession.expires_at).toLocaleString()}</div>
                              {selectedSession.started_at && (
                                <div><strong>Started:</strong> {new Date(selectedSession.started_at).toLocaleString()}</div>
                              )}
                              {selectedSession.completed_at && (
                                <div><strong>Completed:</strong> {new Date(selectedSession.completed_at).toLocaleString()}</div>
                              )}
                              <div><strong>Expires:</strong> {new Date(selectedSession.expires_at).toLocaleString()}</div>
                              {selectedSession.last_activity_at && (
                                <div><strong>Last Activity:</strong> {new Date(selectedSession.last_activity_at).toLocaleString()}</div>
                              )}
                            </div>
                            
                            {selectedSession.progress_data && (
                              <div>
                                <h4 className="font-medium mb-2">Progress Data</h4>
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                  {JSON.stringify(selectedSession.progress_data, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {selectedSession.client_metadata && Object.keys(selectedSession.client_metadata).length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Client Metadata</h4>
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                  {JSON.stringify(selectedSession.client_metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">User:</span> {session.api_users?.external_user_id}
                      </div>
                      <div>
                        <span className="font-medium">Template:</span> {session.api_assessment_templates?.name || 'Default'}
                      </div>
                      <div>
                        <span className="font-medium">Last Activity:</span>{' '}
                        {session.last_activity_at 
                          ? new Date(session.last_activity_at).toLocaleString()
                          : 'Never'
                        }
                      </div>
                    </div>
                    
                    {status === 'active' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Session Token: {session.session_token.substring(0, 20)}...
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredSessions.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No sessions found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Sessions will appear here once assessments are started'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}