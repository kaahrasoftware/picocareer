
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Hub from '@/pages/Hub';
import Profile from '@/pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <MainLayout>
        <Index />
      </MainLayout>
    ),
  },
  {
    path: '/auth',
    element: (
      <MainLayout>
        <Auth />
      </MainLayout>
    ),
  },
  {
    path: '/hub/:hubId',
    element: (
      <MainLayout>
        <Hub />
      </MainLayout>
    ),
  },
  {
    path: '/profile',
    element: (
      <MainLayout>
        <Profile />
      </MainLayout>
    ),
  },
  {
    path: '*',
    element: (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
          <p className="text-muted-foreground">The page you are looking for does not exist.</p>
        </div>
      </MainLayout>
    ),
  },
]);
