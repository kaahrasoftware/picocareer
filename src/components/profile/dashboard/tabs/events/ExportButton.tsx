
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ExportButtonProps {
  selectedEvent: string;
  searchQuery: string;
  eventTitle?: string;
}

export function ExportButton({ selectedEvent, searchQuery, eventTitle }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from('event_registrations')
        .select(`
          id, first_name, last_name, email, country, 
          status, created_at, 
          "current academic field/position", "current school/company",
          events(id, title)
        `);
      
      if (selectedEvent !== 'all') {
        query = query.eq('event_id', selectedEvent);
      }

      if (searchQuery) {
        query = query.ilike('email', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Format the data for CSV
        const formattedData = data.map(reg => ({
          'First Name': reg.first_name,
          'Last Name': reg.last_name,
          'Email': reg.email,
          'Country': reg.country || 'Not specified',
          'Academic Field/Position': reg["current academic field/position"] || 'Not specified',
          'School/Company': reg["current school/company"] || 'Not specified',
          'Event': reg.events?.title || 'Unknown Event',
          'Registration Date': format(new Date(reg.created_at), 'yyyy-MM-dd HH:mm:ss'),
          'Status': reg.status
        }));

        // Convert to CSV
        const header = Object.keys(formattedData[0]).join(',');
        const rows = formattedData.map(row => 
          Object.values(row).map(val => `"${val}"`).join(',')
        );
        const csv = [header, ...rows].join('\n');
        
        // Create and download the file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Use the event title in the filename if available
        const filename = selectedEvent !== 'all' && eventTitle
          ? `${eventTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-registrations-${new Date().toISOString().split('T')[0]}.csv`
          : `event-registrations-${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Successfully exported ${data.length} registrations`);
      } else {
        toast.info('No registrations to export');
      }
    } catch (error: any) {
      console.error('Error exporting registrations:', error.message);
      toast.error('Failed to export registrations');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      className="flex items-center gap-2"
      disabled={isExporting}
    >
      <Download className="h-4 w-4" />
      {isExporting ? 'Exporting...' : selectedEvent !== 'all' 
        ? `Export ${eventTitle || 'Event'} Registrations` 
        : 'Export All Registrations'}
    </Button>
  );
}
