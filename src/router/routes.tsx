import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts';
import { Index } from '@/pages/Index';
import { Auth } from '@/pages/Auth';
import { Hub } from '@/pages/Hub';
import { Profile } from '@/pages/Profile';
import { Pricing } from '@/pages/Pricing';
import { CheckoutSuccess } from '@/pages/CheckoutSuccess';
import { CheckoutCancel } from '@/pages/CheckoutCancel';
import { Mentors } from '@/pages/Mentors';
import { MentorProfile } from '@/pages/MentorProfile';
import { Community } from '@/pages/Community';
import { NotFound } from '@/pages/NotFound';

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
    path: '/pricing',
    element: (
      <MainLayout>
        <Pricing />
      </MainLayout>
    ),
  },
  {
    path: '/checkout/success',
    element: (
      <MainLayout>
        <CheckoutSuccess />
      </MainLayout>
    ),
  },
  {
    path: '/checkout/cancel',
    element: (
      <MainLayout>
        <CheckoutCancel />
      </MainLayout>
    ),
  },
  {
    path: '/mentors',
    element: (
      <MainLayout>
        <Mentors />
      </MainLayout>
    ),
  },
  {
    path: '/mentors/:mentorId',
    element: (
      <MainLayout>
        <MentorProfile />
      </MainLayout>
    ),
  },
  {
    path: '/community',
    element: (
      <MainLayout>
        <Community />
      </MainLayout>
    ),
  },
  {
    path: '*',
    element: (
      <MainLayout>
        <NotFound />
      </MainLayout>
    ),
  },
]);
