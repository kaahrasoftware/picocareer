
import React from 'react';
import { useParams } from 'react-router-dom';
import { BlogPostContent } from '@/components/blog/BlogPostContent';

export default function BlogDetails() {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Blog post not found</h1>
          <p className="text-muted-foreground mt-2">The requested blog post could not be found.</p>
        </div>
      </div>
    );
  }

  return <BlogPostContent postId={id} />;
}
