
import React from 'react';
import { useParams } from 'react-router-dom';

export function BlogArticle() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Blog Article {id}</h1>
        <p className="text-muted-foreground mb-8">
          This is a placeholder for the blog article page. The article ID is: {id}
        </p>
        <div className="prose max-w-none">
          <p>
            Blog article content will be displayed here. This page will show detailed
            blog posts with rich content, images, and interactive elements.
          </p>
        </div>
      </div>
    </div>
  );
}
