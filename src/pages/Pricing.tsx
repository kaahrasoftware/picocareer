
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function Pricing() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that's right for you
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="text-3xl font-bold">$0<span className="text-sm font-normal">/month</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Access to career guidance
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Basic mentorship features
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Community access
              </li>
            </ul>
            <Button className="w-full" variant="outline">Get Started</Button>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>Most popular choice</CardDescription>
            <div className="text-3xl font-bold">$19<span className="text-sm font-normal">/month</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Everything in Free
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Priority mentor matching
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Advanced analytics
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Custom career paths
              </li>
            </ul>
            <Button className="w-full">Start Free Trial</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>For organizations</CardDescription>
            <div className="text-3xl font-bold">Custom</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Everything in Pro
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                API access
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                White-label solutions
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Dedicated support
              </li>
            </ul>
            <Button className="w-full" variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
