
import React from 'react';
import { useParams } from 'react-router-dom';

export default function SchoolDetails() {
  const { id } = useParams();

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">School Details</h1>
        {id ? (
          <p className="text-muted-foreground">Viewing school: {id}</p>
        ) : (
          <p className="text-destructive">School not found</p>
        )}
      </div>
    </div>
  );
}
