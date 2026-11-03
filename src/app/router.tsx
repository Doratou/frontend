import { createBrowserRouter, type RouteObject } from 'react-router';
import { PublicLayout } from '@/app/layouts/public-layout';
import { RouteError } from '@/app/pages/route-error';
import { PageLoading } from '@/components/custom/page-loading';
import { authViews } from '@/features/auth/config';

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
    lazy: () => import('@/features/auth/components/auth-layout'),
    ErrorBoundary: RouteError,
    HydrateFallback: PageLoading,
    children: authViews.map(({ path, view }) => ({
      path,
      handle: view,
      lazy: () => import('@/features/auth/components/auth-screen'),
    })),
  },
];

export const router = createBrowserRouter(routes);
