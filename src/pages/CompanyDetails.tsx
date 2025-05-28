
import React from 'react';
import { useParams } from 'react-router-dom';

export default function CompanyDetails() {
  const { id } = useParams();

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Company Details</h1>
        {id ? (
          <p className="text-muted-foreground">Viewing company: {id}</p>
        ) : (
          <p className="text-destructive">Company not found</p>
        )}
      </div>
    </div>
  );
}
