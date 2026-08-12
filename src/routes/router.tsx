import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RoleGuard } from '@/components/layout/RoleGuard';
import HomePage from '@/features/coupons/HomePage';
import CouponListPage from '@/features/coupons/CouponListPage';
import CouponDetailPage from '@/features/coupons/CouponDetailPage';
import CreateCouponPage from '@/features/coupons/CreateCouponPage';
import EditCouponPage from '@/features/coupons/EditCouponPage';
import DashboardPage from '@/features/coupons/DashboardPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ModerationPage from '@/features/moderation/ModerationPage';
import CommunityPage from '@/features/community/CommunityPage';
import NotFoundPage from '@/routes/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'coupons', element: <CouponListPage /> },
      { path: 'coupons/:id', element: <CouponDetailPage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'coupons/new', element: <CreateCouponPage /> },
          { path: 'coupons/:id/edit', element: <EditCouponPage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          {
            path: 'moderation',
            element: (
              <RoleGuard allow={['ROLE_MODERATOR', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
                <ModerationPage />
              </RoleGuard>
            ),
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
