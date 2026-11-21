import { preload } from 'react-dom';
import { createBrowserRouter, type RouteObject } from 'react-router';
import desktopAuthBackground from '@/assets/auth/desktop-background.webp';
import mobileAuthBackground from '@/assets/auth/mobile-background.webp';
import { PublicLayout } from '@/app/layouts/public-layout';
import { RouteError } from '@/app/pages/route-error';
import { PageLoading } from '@/components/custom/page-loading';
import { authViews } from '@/features/auth/config';
import { DashboardLayout } from './layouts/AppLayout';
import GroupLayout from './layouts/GroupLayout';

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: PublicLayout,
    ErrorBoundary: RouteError,
    HydrateFallback: PageLoading,
    children: [
      { index: true, lazy: () => import('@/app/pages/home') },
      ...(import.meta.env.DEV
        ? [
            {
              path: '/dev/components',
              lazy: () => import('@/app/pages/dev/component-preview'),
            },
          ]
        : []),
      { path: '*', lazy: () => import('@/app/pages/not-found') },
    ],
  },
  {
    path: '/auth/callback',
    lazy: () => import('@/features/auth/components/auth-callback'),
  },
  {
    path: '/auth/google/callback',
    lazy: () => import('@/features/auth/components/auth-callback'),
  },
  {
    lazy: () => {
      preload(
        window.matchMedia('(min-width: 64rem)').matches
          ? desktopAuthBackground
          : mobileAuthBackground,
        { as: 'image', fetchPriority: 'high' },
      );
      return import('@/features/auth/components/auth-layout');
    },
    ErrorBoundary: RouteError,
    HydrateFallback: PageLoading,
    children: authViews.map(({ path, view }) => ({
      path,
      handle: view,
      lazy: () => import('@/features/auth/components/auth-screen'),
    })),
  },
  {
    path: '/home',
    element: <DashboardLayout />,
    children: [
      {
        path: 'notification',
        lazy: () => import('@/app/pages/notifications'),
      },
      {
        path: 'wallet',
        element: <p>کیف پول</p>,
      },
      {
        path: 'profile',
        element: <p>پروفایل کاربر</p>,
      },
    ],
  },
  {
    path: '/group/:groupId',
    element: <GroupLayout />,
    children: [
      {
        index: true,
        lazy: () => import('@/app/pages/group/dashboard'),
      },
      {
        path: 'poll',
        lazy: () => import('@/app/pages/poll'),
      },
      {
        path: 'notification',
        element: <p>نظرسنجی</p>,
      },
      {
        path: 'lottery',
        lazy: () => import('@/app/pages/group/lottery'),
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
