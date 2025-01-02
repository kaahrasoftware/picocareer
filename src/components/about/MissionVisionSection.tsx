import { Target, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MissionVisionSection() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-picocareer-primary to-picocareer-accent opacity-90 flex items-center justify-center">
          <Target className="w-16 h-16 text-white" />
        </div>
        <CardHeader className="flex flex-row items-center gap-4">
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            To empower students and young professionals by providing comprehensive career guidance,
            mentorship opportunities, and educational resources that bridge the gap between academic
            learning and professional success.
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-picocareer-secondary to-picocareer-dark opacity-90 flex items-center justify-center">
          <Flag className="w-16 h-16 text-white" />
        </div>
        <CardHeader className="flex flex-row items-center gap-4">
          <CardTitle>Our Vision</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            To become the world's leading platform for career development and professional growth,
            where every individual can discover their potential and chart their path to success
            through personalized guidance and expert mentorship.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}