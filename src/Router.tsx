
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Index } from './pages/Index';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
}
