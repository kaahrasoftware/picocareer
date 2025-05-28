
import React from 'react';
import { useParams } from 'react-router-dom';

export default function MentorDetails() {
  const { id } = useParams();

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Mentor Details</h1>
        {id ? (
          <p className="text-muted-foreground">Viewing mentor: {id}</p>
        ) : (
          <p className="text-destructive">Mentor not found</p>
        )}
      </div>
    </div>
  );
}
