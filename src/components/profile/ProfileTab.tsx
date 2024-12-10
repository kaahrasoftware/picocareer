import React from "react";

export function ProfileTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 dark:text-gray-400">Profile type:</p>
          <p>Student</p>
        </div>
        <div>
          <p className="text-gray-400 dark:text-gray-400">First Name:</p>
          <p>John</p>
        </div>
        <div>
          <p className="text-gray-400 dark:text-gray-400">Last Name:</p>
          <p>Doe</p>
        </div>
        <div>
          <p className="text-gray-400 dark:text-gray-400">School:</p>
          <p>North Carolina State University</p>
        </div>
        <div>
          <p className="text-gray-400 dark:text-gray-400">Major:</p>
          <p>Biochemical Engineering</p>
        </div>
        <div>
          <p className="text-gray-400 dark:text-gray-400">Location:</p>
          <p>Austin, Texas, USA</p>
        </div>
      </div>
    </div>
  );
}