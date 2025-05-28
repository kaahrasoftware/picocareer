
import React from 'react';
import { ProfileEditForm } from '@/components/profile-details/ProfileEditForm';

export default function ProfileEdit() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
        <ProfileEditForm />
      </div>
    </div>
  );
}
