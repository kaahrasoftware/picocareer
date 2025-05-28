
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import type { PartnershipBenefit, PartnershipType } from '@/types/partnership';

const partnershipTypeLabels: Record<PartnershipType, string> = {
  university: 'Universities',
  high_school: 'High Schools',
  trade_school: 'Trade Schools',
  organization: 'Organizations',
  individual: 'Individuals',
  company: 'Companies',
  nonprofit: 'Nonprofits'
};

export function PartnershipBenefits() {
  const [selectedType, setSelectedType] = useState<PartnershipType>('university');

  const { data: benefits, isLoading } = useQuery({
    queryKey: ['partnership-benefits'],
    queryFn: async (): Promise<PartnershipBenefit[]> => {
      const { data, error } = await supabase
        .from('partnership_benefits')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredBenefits = benefits?.filter(benefit => benefit.partner_type === selectedType) || [];
  
  const benefitCategories = ['access', 'resources', 'support', 'marketing'];
  
  const getCategoryBenefits = (category: string) => 
    filteredBenefits.filter(benefit => benefit.benefit_category === category);

  const getCategoryColor = (category: string) => {
    const colors = {
      access: 'bg-blue-100 text-blue-800',
      resources: 'bg-green-100 text-green-800', 
      support: 'bg-purple-100 text-purple-800',
      marketing: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Partnership Benefits
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the comprehensive benefits available to each type of partner
          </p>
        </div>

        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as PartnershipType)}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-8">
            {Object.entries(partnershipTypeLabels).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="text-xs lg:text-sm">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(partnershipTypeLabels).map((type) => (
            <TabsContent key={type} value={type}>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefitCategories.map((category) => {
                  const categoryBenefits = getCategoryBenefits(category);
                  if (categoryBenefits.length === 0) return null;

                  return (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(category)}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Badge>
                      </div>
                      
                      {categoryBenefits.map((benefit) => (
                        <Card key={benefit.id} className={`${benefit.is_featured ? 'ring-2 ring-purple-200' : ''}`}>
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {benefit.benefit_title}
                              {benefit.is_featured && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Featured
                                </Badge>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {benefit.benefit_description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
