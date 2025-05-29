
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Heart, Users, Zap } from "lucide-react";

export default function Careers() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Work with <span className="text-purple-600">PicoCareer</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our mission to transform career education and help students 
            discover their perfect career paths. We're building the future of career guidance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Mission-Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Make a real impact on students' futures and career success
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Collaborative</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Work with passionate educators and career professionals
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Innovative</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Use cutting-edge technology to solve real-world problems
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Growth-Focused</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Continuous learning and professional development opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Current Opportunities
            </CardTitle>
            <p className="text-gray-600">
              We're always looking for talented individuals to join our team
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-gray-600 mb-8">
              We don't have any open positions at the moment, but we're always interested 
              in connecting with passionate people who want to make a difference in career education.
            </p>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Get in Touch
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Send us your resume and let us know how you'd like to contribute to our mission.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
