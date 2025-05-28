
import React from 'react';
import { useParams } from 'react-router-dom';

export default function CareerDetails() {
  const { id } = useParams();

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Career Details</h1>
        {id ? (
          <p className="text-muted-foreground">Viewing career: {id}</p>
        ) : (
          <p className="text-destructive">Career not found</p>
        )}
      </div>
    </div>
  );
}
