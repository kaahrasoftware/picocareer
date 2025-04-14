
import React from 'react';  // Explicitly import React
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { BookmarksList } from "./BookmarksList";
import { Award } from "lucide-react";
import { ScholarshipProfile } from "./types";

export function ScholarshipBookmarks() {
  const { session } = useAuthSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarked-scholarships', userId],
    queryFn: async () => {
      if (!userId) return { bookmarks: [], totalPages: 0 };
      
      const { data: bookmarks, error } = await supabase
        .from('user_bookmarks')
        .select(`
          id,
          content_id,
          scholarships!inner(
            id,
            title,
            description,
            provider_name,
            status,
            amount,
            deadline,
            demographic_requirements,
            citizenship_requirements,
            application_url
          )
        `)
        .eq('profile_id', userId)
        .eq('content_type', 'scholarship')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedBookmarks = bookmarks.map(bookmark => ({
        id: bookmark.content_id,
        title: bookmark.scholarships.title,
        description: bookmark.scholarships.description,
        provider_name: bookmark.scholarships.provider_name,
        status: bookmark.scholarships.status,
        amount: bookmark.scholarships.amount,
        deadline: bookmark.scholarships.deadline,
        demographic_requirements: bookmark.scholarships.demographic_requirements,
        citizenship_requirements: bookmark.scholarships.citizenship_requirements,
        application_url: bookmark.scholarships.application_url
      }));

      return { 
        bookmarks: formattedBookmarks,
        totalPages: Math.ceil(formattedBookmarks.length / 10)
      };
    },
    enabled: !!userId,
  });

  const [currentPage, setCurrentPage] = React.useState(1);
  const bookmarks = data?.bookmarks || [];
  const totalPages = data?.totalPages || 1;

  const handleViewScholarship = (scholarship: ScholarshipProfile) => {
    // For now we will just log scholarship details
    // In future we can add a scholarship details view
    console.log('View scholarship details:', scholarship);
    
    // If scholarship has application URL, open it in a new tab
    if (scholarship.application_url) {
      window.open(scholarship.application_url, '_blank');
    }
  };

  const renderScholarshipCard = (scholarship: ScholarshipProfile, onView: (scholarship: ScholarshipProfile) => void) => (
    <div
      key={scholarship.id}
      className="cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onView(scholarship)}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-base">{scholarship.title}</h3>
        </div>
        
        <div className="flex flex-col gap-2 mt-4">
          <div className="text-sm">
            <span className="font-medium">Provider:</span>{" "}
            <span className="text-muted-foreground">{scholarship.provider_name}</span>
          </div>
          
          {scholarship.amount && (
            <div className="text-sm">
              <span className="font-medium">Amount:</span>{" "}
              <span className="text-muted-foreground">${scholarship.amount.toLocaleString()}</span>
            </div>
          )}
          
          {scholarship.deadline && (
            <div className="text-sm">
              <span className="font-medium">Deadline:</span>{" "}
              <span className="text-muted-foreground">
                {new Date(scholarship.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {scholarship.status && (
            <div className="text-sm">
              <span className="font-medium">Status:</span>{" "}
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                scholarship.status === 'Open' 
                  ? 'bg-green-50 text-green-700' 
                  : scholarship.status === 'Closing Soon'
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {scholarship.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <BookmarksList
      bookmarks={bookmarks}
      isLoading={isLoading}
      emptyStateProps={{
        icon: <Award className="h-6 w-6 text-primary" />,
        linkPath: "/scholarship",
        type: "scholarships"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={handleViewScholarship}
      renderCard={renderScholarshipCard}
      bookmarkType="scholarship"
    />
  );
}
