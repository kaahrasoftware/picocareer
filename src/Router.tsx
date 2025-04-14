
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Index from './pages/Index';
import { RealTimeProvider } from "./components/RealTimeProvider";
import { RouteChangeHandler } from './RouteChangeHandler';

export function Router() {
  return (
    <BrowserRouter>
      <RealTimeProvider>
        <RouteChangeHandler />
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </RealTimeProvider>
    </BrowserRouter>
  );
}
