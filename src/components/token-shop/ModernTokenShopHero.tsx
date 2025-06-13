import { Card, CardContent } from "@/components/ui/card";
import { Coins, Zap, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";
export function ModernTokenShopHero() {
  const features = [{
    icon: Zap,
    title: "Instant Access",
    description: "Get tokens immediately after purchase"
  }, {
    icon: Shield,
    title: "Secure Payment",
    description: "Protected by industry-standard encryption"
  }, {
    icon: Clock,
    title: "Never Expires",
    description: "Your tokens are always ready to use"
  }];
  return <div className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
      
      
    </div>;
}