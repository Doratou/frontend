import { preload } from 'react-dom';
import { createBrowserRouter, type RouteObject } from 'react-router';
import desktopAuthBackground from '@/assets/auth/desktop-background.webp';
import mobileAuthBackground from '@/assets/auth/mobile-background.webp';
import { PublicLayout } from '@/app/layouts/public-layout';
import { RouteError } from '@/app/pages/route-error';
import { PageLoading } from '@/components/custom/page-loading';
import { authViews } from '@/features/auth/config';
import { DashboardLayout } from './layouts/AppLayout';

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
        element: <p>نوتیفیکیشن</p>,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
