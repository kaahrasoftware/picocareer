
import React from "react";
import { ProfileEditFormProps } from "./types/form-types";

export function ProfileEditForm({ profile, onClose }: ProfileEditFormProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
      <p className="text-muted-foreground mb-4">
        Profile editing functionality will be implemented here.
      </p>
      <div className="flex justify-end gap-2">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
