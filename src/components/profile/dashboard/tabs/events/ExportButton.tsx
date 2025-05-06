
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ExportButtonProps {
  selectedEvent: string;
  searchQuery: string;
  eventTitle?: string;
}

export function ExportButton({ selectedEvent, searchQuery, eventTitle }: ExportButtonProps) {
  const handleExport = async () => {
    try {
      let query = supabase.from('event_registrations').select(`
        first_name,
        last_name,
        email,
        country,
        "current academic field/position",
        "current school/company",
        status,
        created_at
      `);
      
      // Apply filters
      if (selectedEvent !== 'all') {
        query = query.eq('event_id', selectedEvent);
      }
      
      if (searchQuery) {
        query = query.ilike('email', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Convert to CSV
        const headers = [
          'First Name',
          'Last Name',
          'Email',
          'Country',
          'Academic Field/Position',
          'School/Company',
          'Status',
          'Registration Date'
        ];
        
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
          const values = [
            `"${row.first_name || ''}"`,
            `"${row.last_name || ''}"`,
            `"${row.email || ''}"`,
            `"${row.country || ''}"`,
            `"${row['current academic field/position'] || ''}"`,
            `"${row['current school/company'] || ''}"`,
            `"${row.status || ''}"`,
            `"${new Date(row.created_at).toLocaleString()}"`,
          ];
          csvRows.push(values.join(','));
        });
        
        // Create and download file
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', 
          `${selectedEvent !== 'all' ? eventTitle : 'All'}_registrations_${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting registrations:', error);
    }
  };
  
  return (
    <Button 
      onClick={handleExport} 
      variant="outline" 
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      <span>Export CSV</span>
    </Button>
  );
}
