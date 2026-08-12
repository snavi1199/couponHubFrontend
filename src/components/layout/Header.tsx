import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Ticket, PlusCircle, LogOut, LayoutDashboard, ShieldCheck, Menu, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { sessionCleared } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/api/authApi';
import { tokenStorage } from '@/lib/tokenStorage';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { usePrefetchCoupons } from '@/api/couponApi';

export function Header() {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSeller = user?.roles.some((r) => ['ROLE_SELLER', 'ROLE_PREMIUM_SELLER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(r));
  const isModerator = user?.roles.some((r) => ['ROLE_MODERATOR', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(r));
  const prefetchCoupons = usePrefetchCoupons();

  const handleLogout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try { await logout({ refreshToken }).unwrap(); } catch { /* token likely already expired — clear locally anyway */ }
    }
    dispatch(sessionCleared());
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 border-b-2 border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Left group: logo + nav sit together so nav reads as "next to the brand", not floating
            in the middle of the header (a 3-item justify-between spreads unevenly by design). */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-paper">
              <Ticket size={18} />
            </span>
            <span className="font-display text-lg tracking-tight text-ink">CouponHub</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/coupons"
              onMouseEnter={() => prefetchCoupons({ status: 'ACTIVE', size: 12 })}
              className={({ isActive }) => `btn-ghost ${isActive ? 'bg-brand-light text-brand-dark' : ''}`}
            >
              Browse deals
            </NavLink>
            <NavLink to="/community" className={({ isActive }) => `btn-ghost ${isActive ? 'bg-brand-light text-brand-dark' : ''}`}>
              Community
            </NavLink>
            {isModerator && (
              <NavLink to="/moderation" className={({ isActive }) => `btn-ghost ${isActive ? 'bg-brand-light text-brand-dark' : ''}`}>
                <ShieldCheck size={16} /> Moderation
              </NavLink>
            )}
            {isSeller && (
              <NavLink to="/coupons/new" className={({ isActive }) => `btn-ghost ${isActive ? 'bg-brand-light text-brand-dark' : ''}`}>
                <PlusCircle size={16} /> List a coupon
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right group: everything account/action related */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link to="/dashboard" className="hidden btn-ghost sm:inline-flex">
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">{user?.fullName?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="hidden btn-ghost sm:inline-flex" aria-label="Log out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden btn-ghost sm:inline-flex">Log in</Link>
              <Link to="/register" className="hidden btn-primary sm:inline-flex">Sign up free</Link>
            </>
          )}

          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="btn-ghost md:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t-2 border-line bg-paper md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              <NavLink onClick={() => setMobileMenuOpen(false)} to="/coupons" className="btn-ghost justify-start">
                Browse deals
              </NavLink>
              <NavLink onClick={() => setMobileMenuOpen(false)} to="/community" className="btn-ghost justify-start">
                Community
              </NavLink>
              {isModerator && (
                <NavLink onClick={() => setMobileMenuOpen(false)} to="/moderation" className="btn-ghost justify-start">
                  <ShieldCheck size={16} /> Moderation
                </NavLink>
              )}
              {isSeller && (
                <NavLink onClick={() => setMobileMenuOpen(false)} to="/coupons/new" className="btn-ghost justify-start">
                  <PlusCircle size={16} /> List a coupon
                </NavLink>
              )}
              {isAuthenticated ? (
                <>
                  <NavLink onClick={() => setMobileMenuOpen(false)} to="/dashboard" className="btn-ghost justify-start">
                    <LayoutDashboard size={16} /> Dashboard
                  </NavLink>
                  <button onClick={handleLogout} className="btn-ghost justify-start">
                    <LogOut size={16} /> Log out
                  </button>
                </>
              ) : (
                <>
                  <NavLink onClick={() => setMobileMenuOpen(false)} to="/login" className="btn-ghost justify-start">Log in</NavLink>
                  <NavLink onClick={() => setMobileMenuOpen(false)} to="/register" className="btn-primary justify-start">Sign up free</NavLink>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
