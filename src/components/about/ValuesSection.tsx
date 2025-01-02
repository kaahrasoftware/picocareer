import { Target, Users, Flag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ValuesSection() {
  return (
    <section className="pt-12">
      <Card className="bg-gradient-to-br from-picocareer-dark to-picocareer-darker text-white">
        <CardContent className="p-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Excellence</h3>
                <p className="text-white/80">Striving for the highest quality in everything we do</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-white/80">Building strong relationships and fostering collaboration</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Flag className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Innovation</h3>
                <p className="text-white/80">Continuously improving and adapting to change</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}