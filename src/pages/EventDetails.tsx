
import React from 'react';
import { useParams } from 'react-router-dom';

export default function EventDetails() {
  const { id } = useParams();

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Event Details</h1>
        {id ? (
          <p className="text-muted-foreground">Viewing event: {id}</p>
        ) : (
          <p className="text-destructive">Event not found</p>
        )}
      </div>
    </div>
  );
}
