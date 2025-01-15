import React from 'react';
import { MajorDetails } from "@/components/MajorDetails";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { BlogPostDialog } from "@/components/blog/BlogPostDialog";
import type { Major } from "@/types/database/majors";
import type { BlogWithAuthor } from "@/types/blog/types";
import type { Tables } from "@/integrations/supabase/types";

type CareerWithMajors = Tables<"careers"> & {
  career_major_relations: {
    major: {
      title: string;
      id: string;
    };
  }[];
};

interface NotificationDialogsProps {
  type?: string;
  contentId: string;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  majorData?: Major | null;
  careerData?: CareerWithMajors | null;
  blogData?: BlogWithAuthor | null;
}

export function NotificationDialogs({
  type,
  contentId,
  dialogOpen,
  setDialogOpen,
  majorData,
  careerData,
  blogData
}: NotificationDialogsProps) {
  return (
    <>
      {dialogOpen && type === 'major_update' && majorData && (
        <MajorDetails
          major={majorData}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
      {dialogOpen && type === 'career_update' && careerData && (
        <CareerDetailsDialog
          careerId={contentId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
      {dialogOpen && type === 'blog_update' && blogData && (
        <BlogPostDialog
          blog={blogData}
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}