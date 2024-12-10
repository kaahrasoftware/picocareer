import React from "react";

export function CalendarTab() {
  return (
    <div className="flex justify-center">
      <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-full text-white">
        <span className="text-xl">+</span>
        create
      </button>
    </div>
  );
}